from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

db_url = os.getenv("DB_URL")

engine = create_engine(db_url)

Session = sessionmaker(bind=engine)
#session = Session()