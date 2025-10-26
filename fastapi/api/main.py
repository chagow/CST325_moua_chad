from functools import lru_cache
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import List
from sqlalchemy import Numeric, create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from starlette import status
from openai import OpenAI
from configformain import Settings

@lru_cache
def get_settings():
    return Settings()

openai_client = OpenAI(api_key="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")

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql+psycopg2://postgres:adatabase@localhost:5432/products_db'
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProductDB(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Numeric(10,2), nullable=False)

class Product(BaseModel):
    id: int | None = None
    name: str
    price: float

    class Config:
        from_attributes = True

class CreateProduct(Product):
    class Config:
        from_attributes = True

app = FastAPI()

origins = [
    "http://localhost:3000",
]   

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}


@app.get("/api/products", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(ProductDB).all()
    return products

@app.post("/api/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product: CreateProduct, db: Session = Depends(get_db)):

    new_product = ProductDB(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@app.get("/api/products/{product_id}", response_model=CreateProduct, status_code=status.HTTP_200_OK)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id)
    if product.first() is None:
        raise HTTPException(status_code=404, detail="Product not found")
    product.delete(synchronize_session=False)
    db.commit()

@app.put("/api/products/{product_id}", response_model=CreateProduct)
def update_product(product_id: int, updated_product: CreateProduct, db: Session = Depends(get_db)):
    update_product = db.query(ProductDB).filter(ProductDB.id == product_id)

    if update_product.first() is None:
        raise HTTPException(status_code=404, detail="Product not found")
    update_product.update(updated_product.dict(), synchronize_session=False)
    db.commit()
    return update_product.first()


users_db = []

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

@app.post("/api/signup")
async def signup(signup: SignupRequest):
    for user in users_db:
        if user["email"] == signup.email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

    users_db.append({"email": signup.email, "password": signup.password})
    return {"success": True, "message": "Signup successful", "email": signup.email}

@app.get("/api/users")
async def list_users():
    return {"users": users_db}



class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    response: str

@app.post("/api/ai")
def ai_endpoint(payload: ChatRequest):

    load_dotenv()

    ai_key = os.getenv("OPENAI_API_KEY")

    if not ai_key:
        return {
            "stub": True,
            "message": "OPENAI_API_KEY not set; returning stub response",
            "input": payload.text,
            "output": f"This is a stub response for input of length {len(payload.text)}"
        }

    return {
        "stub": False,
        "message": "OPENAI_API_KEY present but remote AI call is not implemented in this stub",
        "input": payload.text,
        "output": f"Received input of length {len(payload.text)}"
    }
