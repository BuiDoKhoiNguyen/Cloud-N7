from flask import Blueprint, Response, request
from flask import Response, request
from flask_restful import Resource

class DefaultApi(Resource):
  
  def get(self):
    return Response("Ping", mimetype="application/json", status=200)
