import './dashBoardCardStyles.css';
import { Link } from "react-router-dom";

export function DashBoardCard({ title, image, link }) {
    return (
        <article class="dashboard-card">
            <div class="image-container">
                <i class={image} />
            </div>
            <div class="button-container">
                <Link to={link} class="text-decoration-none text-default" >
                    <button class="dashboard-card-button">
                        <h3>{title}</h3>
                    </button>
                </Link>
            </div>
        </article>


    )
}