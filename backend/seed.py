from app.core.database import SessionLocal
from app.models.models import (
    User, Profile, Setting, Project, SkillCategory, Skill,
    Experience, Publication, Achievement, Certificate, SocialLink
)
from app.core.security import get_password_hash
from datetime import date

def seed_data():
    db = SessionLocal()
    try:
        admin_email = "admin@portfolio.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            hashed_pw = get_password_hash("admin123")
            admin_user = User(email=admin_email, hashed_password=hashed_pw)
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        # Profile
        profile = db.query(Profile).first()
        if not profile:
            profile = Profile(
                user_id=admin_user.id,
                full_name="Zaid Helsinki Putra",
                headline="Full-Stack Engineer & AI Researcher",
                bio="I started with a deep fascination for clean code and robust systems — building APIs, databases, and structured backends. That foundation naturally expanded into integrating AI models, vector databases, and responsive frontends.\n\nToday I focus on building complete digital solutions that are lightning fast, elegant, and maintainable. I care deeply about architecture, user experience, and delivering software that truly works.",
                education="B.Sc. in Computer Science",
                career_focus="Grounded in full-stack architecture, focused on scalable backend APIs and modern web interfaces.",
                research_interests="Machine Learning Infrastructure, Web Systems",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
                cv_url="/uploads/cv/cf8d5610-c255-4ba2-9486-011576a83ef4.pdf"
            )
            db.add(profile)

        # Settings
        if not db.query(Setting).filter(Setting.key == "site_title").first():
            db.add(Setting(key="site_title", value="Zaid Helsinki - Portfolio", description="Main website title"))
            db.add(Setting(key="contact_email", value="zaidhelsinkiputra@gmail.com", description="Contact email address"))

        # Projects
        if db.query(Project).count() == 0:
            p1 = Project(
                title="Quantum Neural Engine",
                slug="quantum-neural-engine",
                summary="High-performance quantum computing simulation platform built with FastAPI and React.",
                description="A distributed neural network simulator leveraging quantum computing primitives.",
                year=2026,
                status="published",
                is_featured=True,
                github_url="https://github.com/ZaidPutra24/quantum-neural-engine",
                demo_url="https://quantum-engine.example.com",
                thumbnail_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
            )
            p2 = Project(
                title="AI Vector Search Cluster",
                slug="ai-vector-search-cluster",
                summary="Lightning-fast semantic search engine powered by embeddings and vector databases.",
                description="Enterprise-grade vector search with sub-millisecond retrieval times.",
                year=2025,
                status="published",
                is_featured=True,
                github_url="https://github.com/ZaidPutra24/vector-search",
                demo_url="https://vector-search.example.com",
                thumbnail_url="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop"
            )
            p3 = Project(
                title="Distributed FinTech Gateway",
                slug="distributed-fintech-gateway",
                summary="Secure payment gateway architecture handling thousands of concurrent transactions.",
                description="Microservices-based payment gateway with end-to-end encryption and fault tolerance.",
                year=2025,
                status="published",
                is_featured=False,
                github_url="https://github.com/ZaidPutra24/fintech-gateway",
                thumbnail_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
            )
            db.add_all([p1, p2, p3])

        # Experiences
        if db.query(Experience).count() == 0:
            e1 = Experience(
                position_title="Lead AI Systems Engineer",
                organization_name="TechCorp Global",
                location="San Francisco, CA",
                location_type="Remote",
                employment_type="Full-time",
                start_month="January",
                start_year=2024,
                is_current=True,
                description="- Leading the development of scalable AI infrastructure and high-throughput microservices.\n- Architected distributed vector search pipelines reducing latency by 45%.\n- Collaborated with cross-functional teams to deploy machine learning models to production.",
                sort_order=1
            )
            e2 = Experience(
                position_title="Full-Stack Developer",
                organization_name="Innovate Labs",
                location="Jakarta, Indonesia",
                location_type="Hybrid",
                employment_type="Full-time",
                start_month="June",
                start_year=2022,
                end_month="December",
                end_year=2023,
                is_current=False,
                description="- Engineered core backend APIs and responsive frontend dashboards using FastAPI and Next.js.\n- Improved database query performance and implemented robust authentication systems.",
                sort_order=2
            )
            db.add_all([e1, e2])

        # Skill Categories & Skills
        if db.query(SkillCategory).count() == 0:
            c1 = SkillCategory(name="Backend & APIs", order_index=1)
            c2 = SkillCategory(name="Frontend & Web", order_index=2)
            c3 = SkillCategory(name="Systems & Infra", order_index=3)
            db.add_all([c1, c2, c3])
            db.commit()

            s1 = Skill(name="Python / FastAPI", level="Expert", order_index=1, category_id=c1.id)
            s2 = Skill(name="PostgreSQL", level="Advanced", order_index=2, category_id=c1.id)
            s3 = Skill(name="Next.js / React", level="Expert", order_index=1, category_id=c2.id)
            s4 = Skill(name="TypeScript", level="Advanced", order_index=2, category_id=c2.id)
            s5 = Skill(name="Docker & Kubernetes", level="Advanced", order_index=1, category_id=c3.id)
            s6 = Skill(name="Git & CI/CD", level="Expert", order_index=2, category_id=c3.id)
            db.add_all([s1, s2, s3, s4, s5, s6])

        # Publications
        if db.query(Publication).count() == 0:
            pub1 = Publication(
                title="Scalable Vector Embeddings in Distributed Neural Architectures",
                authors="Zaid Helsinki et al.",
                publisher_venue="IEEE Transactions on Neural Networks",
                year=2025,
                abstract="An investigation into optimized vector search algorithms for large-scale AI systems.",
                publication_url="https://doi.org/10.1109/TNNLS.2025.example"
            )
            db.add(pub1)

        # Achievements
        if db.query(Achievement).count() == 0:
            ach1 = Achievement(
                title="1st Place National AI Hackathon",
                category="competition",
                issuer="Ministry of Education & Tech Innovation",
                year_date=date(2025, 8, 15),
                description="First place out of 500+ competing teams nationwide."
            )
            db.add(ach1)

        # Certificates
        if db.query(Certificate).count() == 0:
            cert1 = Certificate(
                name="AWS Certified Solutions Architect",
                issuer="Amazon Web Services",
                issue_date=date(2024, 5, 10),
                credential_id="AWS-SA-12345",
                credential_url="https://aws.amazon.com/verification",
                image_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop"
            )
            db.add(cert1)

        # Social Links
        if db.query(SocialLink).count() == 0:
            sl1 = SocialLink(platform_name="GitHub", url="https://github.com/ZaidPutra24/", order_index=1, is_active=True)
            sl2 = SocialLink(platform_name="LinkedIn", url="https://www.linkedin.com/in/zaid-helsinki-putra", order_index=2, is_active=True)
            db.add_all([sl1, sl2])

        db.commit()
        print("Database seeded successfully with rich dummy data across all menus and thumbnail assets!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
