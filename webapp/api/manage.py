from flask.cli import FlaskGroup
from flask_migrate import Migrate

from api import app
from models import db, User, Upload, Image

cli = FlaskGroup(app)

migrate = Migrate(app, db)

@cli.command("create_db")
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()

@cli.command("seed_db")
def seed_db():
    #user = User(username="ai2c-admin", email="kratch.adam@gmail.com")
    #user.set_password("admin")
    #db.session.add(user)
    db.session.commit()
    db.session.close()

if __name__ == "__main__":
    cli()