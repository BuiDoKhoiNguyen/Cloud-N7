from flask import Flask, request, Response
from flask_restful import Api
from .models import initialize_db
from .routes import initialize_routes

def create_app():
  app = Flask(__name__)

  app.config['MONGODB_SETTINGS'] = {
    'host': "mongodb+srv://pmquy204:pmquy204@cluster0.4a5j70b.mongodb.net/?retryWrites=true&w=majority",
    "db": "recommend",
  }

  initialize_db(app)

  api = Api(app)
  initialize_routes(api)
  
  return app