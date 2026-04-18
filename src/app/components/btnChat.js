import { Icon } from '@/components/icon';

export default function btnChat(props) {
    return(
        <a className="btn-chat btn btn-success btn-lg" href="https://web.whatsapp.com/send?phone=+573162795010" target="_blank"><Icon name="whatsapp" size={16} /> {props.translation}</a>
    );
}
