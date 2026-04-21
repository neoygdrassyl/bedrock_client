import './dashBoardCardStyles.css';
import { Link } from "react-router-dom";
import { Icon } from '@/components/icon';

export function DashBoardCard({ title, image, link }) {
    return (
        <Link to={link} style={{
            textDecoration: 'none',
            color: 'var(--bs-primary)',
        }}>
            <button className="dashboard-card">
                <div className="image-container">
                    {/* Use Icon bridge for FA/Lucide compatibility */}
                    <Icon name={image} />
                </div>
                <div className="title-container">
                    <h3>{title}</h3>
                </div>
            </button>
        </Link>



    )
}
