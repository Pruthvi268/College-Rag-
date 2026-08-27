import os
import uuid
import logging
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest_models
from app.core.config import settings

logger = logging.getLogger(__name__)

VECTOR_DIM = 768


class VectorStoreManager:
    """Manages Qdrant vector database operations for CollegeRAG knowledge base."""

    def __init__(self):
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self.client = self._init_client()
        self._ensure_collection_exists()

    def _init_client(self) -> QdrantClient:
        """Initialize Qdrant client for local persistent mode or remote server."""
        if settings.QDRANT_URL:
            logger.info(f"Connecting to remote Qdrant at {settings.QDRANT_URL}")
            return QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None,
            )
        else:
            storage_path = os.path.abspath(settings.QDRANT_STORAGE_PATH)
            os.makedirs(storage_path, exist_ok=True)
            logger.info(f"Initializing local persistent Qdrant at {storage_path}")
            return QdrantClient(path=storage_path)

    def _ensure_collection_exists(self):
        """Create Qdrant collection if not already created."""
        try:
            collections_res = self.client.get_collections()
            collection_names = [c.name for c in collections_res.collections]
            
            if self.collection_name not in collection_names:
                logger.info(f"Creating Qdrant collection: {self.collection_name}")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=rest_models.VectorParams(
                        size=VECTOR_DIM,
                        distance=rest_models.Distance.COSINE,
                    ),
                )
        except Exception as e:
            logger.error(f"Error ensuring Qdrant collection exists: {e}")

    def upsert_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]]
    ) -> List[str]:
        """Upsert document chunks and their vectors into Qdrant."""
        if not chunks or not embeddings:
            return []

        points = []
        point_ids = []

        for i, chunk in enumerate(chunks):
            point_id = str(uuid.uuid4())
            point_ids.append(point_id)

            payload = {
                "document_id": chunk.get("document_id"),
                "chunk_index": chunk.get("chunk_index"),
                "content": chunk.get("content"),
                "page_number": chunk.get("page_number", 1),
                "token_count": chunk.get("token_count", 0),
                "title": chunk.get("title", ""),
                "filename": chunk.get("filename", ""),
                "category": chunk.get("category", "General"),
                "department": chunk.get("department", "All"),
                "academic_year": chunk.get("academic_year", "2026-27"),
                "version": chunk.get("version", "1.0"),
            }

            points.append(
                rest_models.PointStruct(
                    id=point_id,
                    vector=embeddings[i],
                    payload=payload,
                )
            )

        self.client.upsert(
            collection_name=self.collection_name,
            points=points,
        )
        logger.info(f"Upserted {len(points)} points into collection {self.collection_name}")
        return point_ids

    def search(
        self,
        query_vector: List[float],
        limit: int = 5,
        score_threshold: float = 0.0,
        filter_category: Optional[str] = None,
        filter_dept: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Perform semantic similarity search on Qdrant vectors with optional payload filters."""
        query_filter = None
        filter_conditions = []

        if filter_category and filter_category.lower() not in ["all", "general"]:
            filter_conditions.append(
                rest_models.FieldCondition(
                    key="category",
                    match=rest_models.MatchValue(value=filter_category),
                )
            )
        
        if filter_dept and filter_dept.lower() not in ["all", "general"]:
            filter_conditions.append(
                rest_models.FieldCondition(
                    key="department",
                    match=rest_models.MatchValue(value=filter_dept),
                )
            )

        if filter_conditions:
            query_filter = rest_models.Filter(must=filter_conditions)

        try:
            if hasattr(self.client, "query_points"):
                response = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_vector,
                    limit=limit,
                    score_threshold=score_threshold if score_threshold > 0 else None,
                    query_filter=query_filter,
                )
                search_results = response.points
            else:
                search_results = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_vector,
                    limit=limit,
                    score_threshold=score_threshold if score_threshold > 0 else None,
                    query_filter=query_filter,
                )

            results = []
            for hit in search_results:
                payload = hit.payload or {}
                results.append({
                    "id": hit.id,
                    "score": float(hit.score),
                    "content": payload.get("content", ""),
                    "page_number": payload.get("page_number", 1),
                    "document_id": payload.get("document_id"),
                    "title": payload.get("title", ""),
                    "filename": payload.get("filename", ""),
                    "category": payload.get("category", "General"),
                    "department": payload.get("department", "All"),
                    "academic_year": payload.get("academic_year", "2026-27"),
                })
            return results
        except Exception as e:
            logger.error(f"Search in vector store failed: {e}")
            return []

    def delete_document_vectors(self, document_id: int):
        """Delete all vectors matching document_id from Qdrant."""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=rest_models.FilterSelector(
                    filter=rest_models.Filter(
                        must=[
                            rest_models.FieldCondition(
                                key="document_id",
                                match=rest_models.MatchValue(value=document_id),
                            )
                        ]
                    )
                ),
            )
            logger.info(f"Deleted vectors for document_id: {document_id}")
        except Exception as e:
            logger.error(f"Failed to delete vectors for doc {document_id}: {e}")

    def count_vectors(self) -> int:
        """Count total vectors indexed in collection."""
        try:
            info = self.client.get_collection(collection_name=self.collection_name)
            return info.points_count or 0
        except Exception:
            return 0


vector_store = VectorStoreManager()
