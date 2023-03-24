export default function  btnStart() {
    function scrollPage(){
        window.scrollTo(0, 0); 
    }
    return(
        <button className="btn-start btn btn-info btn-rounded" onClick={scrollPage}><i class="fas fa-chevron-up fa-2x"></i></button>
    );
}