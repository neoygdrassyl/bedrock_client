import { createGlobalStyle } from "styled-components"
export const GlobalStyles = createGlobalStyle`
  .container-primary {
    background: ${({ theme }) => theme.bodyPrimary};
    color: ${({ theme }) => theme.textPrimary};
    font-family:  Roboto, Helvetica, Arial, sans-serif; 
    transition: all 0.50s linear;
  }
  
  .container-secondary {
    background: ${({ theme }) => theme.bodySecondary};
    color: ${({ theme }) => theme.textSecondary};
    font-family:  Roboto, Helvetica, Arial, sans-serif; 
    transition: all 0.50s linear;
  }
  .app-text-primary{
      color: ${({ theme }) => theme.textPrimary};
  }
  .app-text-secondary{
    color: ${({ theme }) => theme.textSecondary};
}
  .bg-card {
    background: ${({ theme }) => theme.cardBackground};
    color: ${({ theme }) => theme.textPrimary};
    border: 2px solid ${({ theme }) => theme.cardborder};
    font-family:  Roboto, Helvetica, Arial, sans-serif; 
    transition: all 0.50s linear;
  }
  .bg-card-2 {
    background: ${({ theme }) => theme.cardBackground2};
    color: ${({ theme }) => theme.textSecondary};
    border: 2px solid ${({ theme }) => theme.cardborder};
    font-family:  Roboto, Helvetica, Arial, sans-serif; 
    transition: all 0.50s linear;
  }

  .form-control {
    background-color: ${({ theme }) => theme.inputdBackground};
    color: ${({ theme }) => theme.inputText};
  }

  .form-select {
    background-color: ${({ theme }) => theme.inputdBackground};
    color: ${({ theme }) => theme.inputText};
  }
  ::placeholder { 
    color: red;
    opacity: 1;
  }
  
  .bg-image-gr {
    background-image: 
    linear-gradient(
        ${({ theme }) => theme.bgImgGradient1}, 
        ${({ theme }) => theme.bgImgGradient2},
        ${({ theme }) => theme.bgImgGradient3}
    ), url('../img/map.png');
  }

  .Collapsible {
    background: ${({ theme }) => theme.bodySecondary};
    color: ${({ theme }) => theme.textSecondary};
  }
  .Collapsible__contentInner{
    background-color:  ${({ theme }) => theme.bodyPrimary};
    color: ${({ theme }) => theme.textPrimary};
    border-color:  ${({ theme }) => theme.bodySecondary};
  }
  .Collapsible__trigger{
    color: ${({ theme }) => theme.textSecondary};
  }
  .bg-dd{
    background: ${({ theme }) => theme.cardBackground};
  }
  p {
    font-size: ${({ theme }) => theme.fontSizeP};
  }
  .app-p {
    font-size: ${({ theme }) => theme.fontSizeH3};
  }
  h1 {
    font-size: ${({ theme }) => theme.fontSizeH1};
  }
  h2 {
    font-size: ${({ theme }) => theme.fontSizeH2};
  }
  h3 {
    font-size: ${({ theme }) => theme.fontSizeH3};
  }
  h4 {
    font-size: ${({ theme }) => theme.fontSizeH4};
  }
  h5 {
    font-size: ${({ theme }) => theme.fontSizeH5};
  }
  h6 {
    font-size: ${({ theme }) => theme.fontSizeH6};
  }
  .btn-nav {
    color: ${({ theme }) => theme.textSecondary};
    border-color: ${({ theme }) => theme.cardborder};
    background-color: ${({ theme }) => theme.bodySecondary};
  }
  .btn-nav:hover {
    color: ${({ theme }) => theme.textPrimary};
    border-color: ${({ theme }) => theme.bodySecondary};
  }
  .btn-nav:focus{
    background-color: ${({ theme }) => theme.cardBackground};
    color: ${({ theme }) => theme.textPrimary};
  }
  td {
    color: ${({ theme }) => theme.textPrimary};
  }
  th {
    color: ${({ theme }) => theme.textPrimary};
  }
  .rdt_Table  {
    background: ${({ theme }) => theme.bodyPrimary};
    color: ${({ theme }) => theme.textPrimary};
    font-family:  Roboto, Helvetica, Arial, sans-serif; 
    transition: all 0.50s linear;
  }
  `;