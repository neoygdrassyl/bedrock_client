import './dashBoardCardStyles.css';
import { Link } from "react-router-dom";

export function DashBoardCard({ title, image, link, isNew }) {
    return (
        <Link to={link} style={{
            textDecoration: 'none',
            color: 'royalblue',
        }}>
            <button class="dashboard-card">
                <div class="image-container">
                    <i class={image} />
                </div>
                {isNew && (
                    <div class="dashboard-new">  
                        Nuevo!
                    </div>
                )}
                <div class="title-container">
                    <h3 >{title}</h3>
                </div>
            </button>
        </Link >



    )
}