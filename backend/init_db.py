from app import app, db

with app.app_context():
    print("Database:", db.engine.url.database)
    print("Host:", db.engine.url.host)

    db.create_all()

    print("TABLE CREATION DONE")