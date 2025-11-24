from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import uuid
import jwt
import datetime
from functools import wraps

app = Flask(__name__)

# Allow all origins for now
CORS(app, resources={r"/*": {"origins": "*"}})

# ======== CONFIGURATION ========
REGION = "ap-south-1"
BUCKET_NAME = "smart-drive-files-aishwarya"
FILES_TABLE = "Files"
USERS_TABLE = "Users"
SECRET_KEY = "aishwarya_secret_key"  # For JWT token

# ======== AWS CLIENTS ========
s3 = boto3.client("s3", region_name=REGION)
dynamodb = boto3.resource("dynamodb", region_name=REGION)
files_table = dynamodb.Table(FILES_TABLE)
users_table = dynamodb.Table(USERS_TABLE)


# ======== JWT HELPERS ========
def create_token(email):
    """Create a JWT token for the given email."""
    payload = {
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        "iat": datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def require_token(f):
    """Decorator to protect routes with JWT."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth_header.split(" ", 1)[1]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        request.user_email = payload["email"]
        return f(*args, **kwargs)

    return wrapper


# ======== HOME ROUTE ========
@app.route("/")
def home():
    return jsonify({"message": "Smart Drive Backend is running successfully!"})


# ======== SIGNUP ROUTE ========
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    response = users_table.get_item(Key={"email": email})
    if "Item" in response:
        return jsonify({"error": "User already exists"}), 400

    users_table.put_item(Item={"email": email, "password": password})
    token = create_token(email)

    return jsonify({"message": "Signup successful!", "token": token, "email": email}), 200


# ======== LOGIN ROUTE ========
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    response = users_table.get_item(Key={"email": email})
    user = response.get("Item")

    if not user or user.get("password") != password:
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_token(email)

    return jsonify({"message": "Login successful!", "token": token, "email": email}), 200


# ======== UPLOAD FILE ========
@app.route("/upload", methods=["POST"])
@require_token
def upload_file():
    email = getattr(request, "user_email", None)

    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    file_id = str(uuid.uuid4())
    file_name = file.filename if file.filename else "Unnamed file"
    s3_key = f"{file_id}_{file_name}"

    try:
        s3.upload_fileobj(file, BUCKET_NAME, s3_key)

        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET_NAME, "Key": s3_key},
            ExpiresIn=3600
        )

        files_table.put_item(Item={
            "file_id": file_id,
            "file_name": file_name,
            "s3_key": s3_key,
            "upload_date": str(datetime.datetime.utcnow()),
            "email": email,
            "url": url
        })

        return jsonify({
            "message": "File uploaded successfully!",
            "file_id": file_id,
            "file_name": file_name,
            "url": url
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======== LIST FILES ========
@app.route("/files", methods=["GET"])
@require_token
def list_files():
    email = getattr(request, "user_email", None)

    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        response = files_table.scan()
        items = response.get("Items", [])
        user_files = [item for item in items if item.get("email") == email]

        for item in user_files:
            item["url"] = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": BUCKET_NAME, "Key": item["s3_key"]},
                ExpiresIn=3600
            )

        return jsonify(user_files), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======== DELETE FILE ========
@app.route("/delete/<file_id>", methods=["DELETE"])
@require_token
def delete_file(file_id):
    email = getattr(request, "user_email", None)

    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        response = files_table.get_item(Key={"file_id": file_id})
        if "Item" not in response:
            return jsonify({"error": "File not found"}), 404

        item = response["Item"]

        if item.get("email") != email:
            return jsonify({"error": "You cannot delete this file"}), 403

        s3.delete_object(Bucket=BUCKET_NAME, Key=item["s3_key"])
        files_table.delete_item(Key={"file_id": file_id})

        return jsonify({"message": "File deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======== RUN APP ========
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
