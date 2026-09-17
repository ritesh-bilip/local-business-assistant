import io
from minio import Minio
from django.conf import settings
import os

_client = None

def get_client() -> Minio:
    global _client
    if _client is None:
        _client = Minio(
            os.getenv("MINIO_ENDPOINT", "localhost:9000"),
            access_key=os.getenv("MINIO_ACCESS_KEY"),
            secret_key=os.getenv("MINIO_SECRET_KEY"),
            secure=os.getenv("MINIO_SECURE", "False") == "True",
        )
        bucket = os.getenv("MINIO_BUCKET", "lba-documents")
        if not _client.bucket_exists(bucket):
            _client.make_bucket(bucket)
    return _client

def upload_file(key: str, data: bytes, content_type: str = "application/octet-stream"):
    client = get_client()
    bucket = os.getenv("MINIO_BUCKET", "lba-documents")
    client.put_object(
        bucket, key, io.BytesIO(data), length=len(data), content_type=content_type
    )
    return key

def download_file(key: str) -> bytes:
    client = get_client()
    bucket = os.getenv("MINIO_BUCKET", "lba-documents")
    resp = client.get_object(bucket, key)
    try:
        return resp.read()
    finally:
        resp.close()
        resp.release_conn()