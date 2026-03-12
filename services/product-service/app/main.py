from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/productsdb")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# --- Database Model ---
class ProductModel(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# --- Pydantic Schema ---
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int

class ProductResponse(ProductCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- App ---
app = FastAPI(title="Product Service")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok", "service": "product-service"}

@app.get("/products", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductModel).all()

@app.get("/products/{id}", response_model=ProductResponse)
def get_product(id: int, db: Session = Depends(get_db)):
    p = db.query(ProductModel).filter(ProductModel.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

@app.post("/products", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    p = ProductModel(**product.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@app.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    p = db.query(ProductModel).filter(ProductModel.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    return {"message": "deleted"}
