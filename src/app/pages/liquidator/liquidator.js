import React, { Component } from 'react';
import {
  MDBTypography, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBBreadcrumb, MDBBreadcrumbItem
} from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import Collapsible from 'react-collapsible';
import moment from 'moment';
import { infoCud } from '../../components/jsons/vars';
import { Button_navigation } from '../../components/button.component';

class Liquidator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subtotal_cf: 0,
      subtotal_cv: 0,
      ledged_rows: 0,
      table: [],
      version: props.versioni,
      iva: 0.19,
    };
  }


  render() {
    const { translation, breadCrums, hideInfo, useSelector } = this.props;
    const { version } = this.state;

    const query = new URLSearchParams(window.location.search);
    const id = query.get('newsId');

    this.componentDidMount = () => {
      if (id != null) {
        document.getElementById(id).scrollIntoView()
      }
    }


    /* WORKING VARIABLES FOR THE LIQUIDATOR
    EXPENSES CALCULATION
    e = (cf * i x m) + (cv * i * j * m)

    THIS VARIABLES WORK AS FOR 2021 THEY NEED TO BE UPDATED EVERY YEAR
    */
    const values = {
      '2021': { value: 908526, units: 'SMLV', name: 'SALARIO MINIMO MENSUAL VIGENTE', cfi: 0.4, cvi: 0.8 },
      '2022': { value: 38004, units: 'UVT', name: 'UNIDAD DE VALOR TRIBUTARIO', cfi: 10.01, cvi: 20.02 },
      '2023': { value: 42412, units: 'UVT', name: 'UNIDAD DE VALOR TRIBUTARIO', cfi: 10.01, cvi: 20.02 },
    }
    var smmv = values[version].value; // Mininum wage
    const m = infoCud.m; // Factor m
    const iva = this.state.iva;
    var i;
    var j;
    var strata = [0.5, 1, 1.5, 2, 2.5]; // base on strata
    var use = [2.9, 3.2, 4]; // base on use
    var cf = values[version].value * values[version].cfi;
    var cv = values[version].value * values[version].cvi;

    const model2TableStr1 = 'Articulo 2.2.6.6.8.15 Expensas por otras actuaciones. Los curadores urbanos podrán cobrar las siguientes expensas por las otras actuaciones de que trata el artículo 2.2.6.1.3.1 del presente decreto, siempre y cuando estas se ejecuten de manera independiente a la expedición de la licencia:';

    const model2Table = [
      {
        title: 'Licencia de subdivisión 2.2.6.6.8.10', list: [
          { name: 'Urbana y Rural, Sin rango. m2', const: { '2021': [1], '2022': [25.02], '2023': [25.02] } },
          { name: 'Reloteo, Área útil urbanizable (0 a 1000m2)', const: { '2021': [2 / 30, 'SMLD', 2], '2022': [1.67], '2023': [1.67] } },
          { name: 'Reloteo, Área útil urbanizable (1001 a 5000m2)', const: { '2021': [0.5], '2022': [12.51], '2023': [12.51] } },
          { name: 'Reloteo, Área útil urbanizable (5001 a 10000m2)', const: { '2021': [1], '2022': [25.02], '2023': [25.02] } },
          { name: 'Urbana y Rural, Sin rango. m2', const: { '2021': [1.5], '2022': [37.53], '2023': [37.53] } },
          { name: 'Urbana y Rural, Sin rango. m2', const: { '2021': [2], '2022': [50.05], '2023': [50.05] } },
        ]
      },
      {
        title: 'Prorroga o revalidación de licencia', list: [
          { name: 'Cada Una', const: { '2021': [1], '2022': [25.02], '2023': [25.02] } },
          { name: 'Cada Una (VIS)', const: { '2021': false, '2022': [1.67], '2023': [1.67] } },
          { name: 'Segunda Prorroga o Segunda revalidación', const: { '2021': false, '2022': [50.05], '2023': [50.05] } },
        ]
      },
      { title: model2TableStr1 },
      {
        title: 'Ajuste de cotas', list: [
          { name: 'Estrato 1 y 2', const: { '2021': [4 * 1 / 30, 'SMLD', 4], '2022': [3.34], '2023': [3.34] } },
          { name: 'Estrato 3 y 4', const: { '2021': [8 * 1 / 30, 'SMLD', 8], '2022': [6.67], '2023': [6.67] } },
          { name: 'Estrato 3 y 4', const: { '2021': [1], '2022': [10.01], '2023': [10.01] } },
        ],
        Ids: 'Id_1',

      },
      {
        title: 'Copia certificada de Planos', list: [
          { name: 'Por cada plano', const: { '2021': [1 * 1 / 30, 'SMLD', 1], '2022': [0.834], '2023': [0.834] } },
        ]
      },
      {
        title: 'Visto bueno P.H.', list: [
          { name: 'Hasta 250 m2', const: { '2021': [0.25], '2022': [6.26], '2023': [6.26] } },
          { name: 'De 251 a 500 m2', const: { '2021': [0.5], '2022': [12.51], '2023': [12.51] } },
          { name: 'De 501 a 1000 m2', const: { '2021': [1], '2022': [25.02], '2023': [25.02] } },
          { name: 'De 1001 a 5000 m2', const: { '2021': [2], '2022': [50.05], '2023': [50.05] } },
          { name: 'De 5001 a 10000 m2', const: { '2021': [3], '2022': [75.07], '2023': [75.07] } },
          { name: 'De 10001 a 20000 m2', const: { '2021': [4], '2022': [100.09], '2023': [100.09] } },
          { name: 'Mas de 20000 m2', const: { '2021': [5], '2022': [125.11], '2023': [125.11] } },
        ]
      },
      {
        title: 'Movimiento de tierras y construcción de piscinas', list: [
          { name: 'Hasta 100 m3', const: { '2021': [2 * 1 / 30, 'SMLD', 2], '2022': [1.67], '2023': [1.67] } },
          { name: 'De 101 a 500 m3', const: { '2021': [4 * 1 / 30, 'SMLD', 4], '2022': [3.34], '2023': [3.34] } },
          { name: 'De 501 a 1000 m3', const: { '2021': [1], '2022': [25.02], '2023': [25.02] } },
          { name: 'De 1001 a 5000 m3', const: { '2021': [2], '2022': [50.05], '2023': [50.05] } },
          { name: 'De 5001 a 10000 m3', const: { '2021': [3], '2022': [75.07], '2023': [75.07] } },
          { name: 'De 10001 a 20000 m3', const: { '2021': [4], '2022': [100.09], '2023': [100.09] } },
          { name: 'Mas de 20000 m3', const: { '2021': [5], '2022': [125.11], '2023': [125.11] } },
        ]
      },
      {
        title: 'Modificación Planos Urbanisticos', list: [
          { name: 'Cada Una', const: { '2021': [1], '2022': [25.02], '2023': [25.02] } },
        ]
      },
      {
        title: 'Concepto Norma Urbanistica', list: [
          { name: 'Cada Uno', const: { '2021': [10 * 1 / 30, 'SMLD', 10], '2022': [8.34], '2023': [8.34] } },
        ]
      },
      {
        title: 'Concepto Uso del suelo', list: [
          { name: 'Cada Uno', const: { '2021': [2 * 1 / 30, 'SMLD', 2], '2022': [1.67], '2023': [1.67] } },
        ]
      },
    ]
    /*
        Q is the area express in m2
        Q < 100                   -> j = 0.45
        100 < Q < 11.000          -> j = (3.8/(0.12+(800/Q))) 
        Q > 11.000                -> j = (2.2/(0.018+(800/Q))) 
        Uranismo and Parcelacion  -> j = (4/(0.025+(2000/Q)))
    */
    let object = {
      project: '',
      use: '',
      social: '',
      strata: '',
      area: 0,
      module: '',
    }

    function formatNumber(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    function set_i() {
      let Q = object.area;
      if (object.use == 0) {
        i = strata[object.strata];
      }
      else if (object.use == 1) {
        if (Q <= 300) {
          i = use[0];
        }
        if (Q > 300 && Q <= 1000) {
          i = use[1];
        }
        if (Q > 1000) {
          i = use[2];
        }
      }
    }
    function set_j() {
      let Q = object.area;
      if (object.project != 1 && object.project != 4) {
        if (Q <= 100) {
          j = 0.45;
        }
        if (Q > 100 && Q < 11000) {
          j = (3.8 / (0.12 + (800 / Q)));
        }
        if (Q >= 11000) {
          j = (2.2 / (0.018 + (800 / Q)));
        }
      }
      else j = (4 / (0.025 + (2000 / Q)));
    }
    function set_object() {
      object.project = document.getElementById("project-liquidator").value;
      object.use = document.getElementById("use-liquidator").value;
      object.social = document.getElementById("social-liquidator").value;
      object.strata = document.getElementById("strata-liquidator").value;
      object.module = document.getElementById("select_type").value;
      object.area = document.getElementById("area-liquidator").value;
    }
    let handleUse = (event) => {
      object.use = event.target.value;
      if (event.target.value == 1) {
        document.getElementById("social-liquidator").disabled = true;
        document.getElementById("strata-liquidator").disabled = true;
      } else {
        document.getElementById("social-liquidator").disabled = false;
        document.getElementById("strata-liquidator").disabled = false;
      }
    }
    let _ADD_VALUE_TABLE = (_subtotal_cf, _subtotal_cv) => {
      let _CHARGE = {
        sub: 0,
        iva: 0,
        total: 0,
        info: "",
        id: 0
      }
      var list = this.state.table;

      if (list.length == 0) {
        _CHARGE.sub = Math.trunc(_subtotal_cf);
        _CHARGE.iva = Math.trunc(_subtotal_cf * this.state.iva);
        _CHARGE.total = Math.trunc(_subtotal_cf * this.state.iva + _subtotal_cf);
        _CHARGE.info = "Cargo Fijo";
        list.push(_CHARGE);
      }
      _CHARGE = {
        sub: 0,
        iva: 0,
        total: 0,
        info: "",
        id: 0
      }
      _CHARGE.sub = Math.trunc(_subtotal_cv);
      _CHARGE.iva = Math.trunc(_subtotal_cv * this.state.iva);
      _CHARGE.total = Math.trunc(_subtotal_cv * this.state.iva + _subtotal_cv);
      _CHARGE.info = "Cargo Variable - " + document.getElementById("select_type").value + " (" + document.getElementById("area-liquidator").value + "m)";

      list.push(_CHARGE);

      // CALCULATE TOTALS
      var _TOTALS = {
        sub: 0,
        iva: 0,
        total: 0,
        info: "",
        id: 0
      }
      for (var i = 0; i < list.length; i++) {
        _TOTALS.sub += list[i].sub
        _TOTALS.iva += list[i].iva
        _TOTALS.total += list[i].total
      }
      _TOTALS.info = "Totales"
      if (list.length > 2) {
        list.splice(list.length - 2, 1,);
        _TOTALS.id = list.length + 1;
      } else {
        _TOTALS.id = list.length;
      }

      list.push(_TOTALS);

      for (var i = 0; i < list.length; i++) {
        list[i].id = i;
      }

      this.setState({ table: list })
    }

    let handleSubmit = (event) => {
      event.preventDefault();
      set_object();
      set_i();
      set_j();
      let h = 1; // Social interest var, use to divide cv by hafl when is used
      if (object.use == 0 && object.social == 0) {
        h = 2;
      }
      // e = (cf * i * m) + (cv * i * j * m)
      let rule_1 = object.module == 'Modificacion' || object.module == 'Reforzamiento' || object.module == 'Restauracion' ? 0.3 : 1;
      let rule_2 = object.module == 'Adecuacion (Sin Obras)' ? 0.5 : 1;
      let rule_21 = object.module == 'Adecuacion (Sin Obras)' ? 0 : 1;

      let _subtotal_cf = (cf * rule_1 * rule_2) * i * m;
      let _subtotal_cv = ((cv * rule_1 * rule_21) / h * i * j * m);

      this.setState({ subtotal_cf: _subtotal_cf });
      this.setState({ subtotal_cv: _subtotal_cv });
      _ADD_VALUE_TABLE(_subtotal_cf, _subtotal_cv)
    }
    let getExpenses_m = (number) => {
      let value = smmv * number;
      return formatNumber(Math.round(value))
    }
    let getIva_m = (number) => {
      let value = smmv * number * iva;
      return formatNumber(Math.round(value))
    }
    let getTotal_m = (number) => {
      let value = smmv * number + smmv * number * iva;
      return formatNumber(Math.round(value))
    }


    let _TABLE_INFO = () => {
      var _COMPONENT = [];
      var _LIST = this.state.table;
      const columns = [
        {
          name: <h3>Modalidad</h3>,
          minWidth: '350px',
          cell: row => <h5 className={row.id == _LIST.length - 1 ? "fw-bold" : ""}>{row.info}</h5>
        },
        {
          name: <h3>Subtotal</h3>,
          cell: row => <h4 className={row.id == _LIST.length - 1 ? "lead fw-bold" : "lead"}>${formatNumber(row.sub)}</h4>
        },
        {
          name: <h3>IVA</h3>,
          cell: row => <h4 className={row.id == _LIST.length - 1 ? "lead fw-bold" : "lead"}>${formatNumber(row.iva)}</h4>
        },
        {
          name: <h3>Total</h3>,
          cell: row => <h4 className={row.id == _LIST.length - 1 ? "lead fw-bold" : "lead"}>${formatNumber(row.total)}</h4>
        },
        {
          name: <h4></h4>,
          button: true,
          id: "",
          cell: row => <> {row.id == 0 || row.id == _LIST.length - 1 || _LIST.length < 4
            ? ""
            : <button className="btn btn-sm btn-danger mx-1 p-1" onClick={() => _DELETE_ROW(row.id)}><i class="far fa-times-circle fa-2x"></i></button>}
          </>,
        },
      ]
      _COMPONENT.push(<>
        <DataTable
          noDataComponent="No hay mensajes"
          striped="true"
          columns={columns}
          data={_LIST}
          highlightOnHover
          className="data-table-component"
          noHeader
        />
      </>)
      return <>{_COMPONENT}</>

    }
    let _DELETE_ROW = (_ID) => {
      var list = this.state.table;
      list.splice(_ID, 1);
      for (var i = 0; i < list.length; i++) {
        list[i].id = i;
      }

      this.setState({ table: list })
    }

    let _note_1 = <>
      <p className="text-justify">Las expensas es el ingreso que percibe el curador urbano por los servicios prestados, tiene como finalidad cubrir los gastos en que incurre para desarrollar su labor; tales
        como el pago del grupo interdisciplinario, los costos operativos y la remuneración del curador urbano. Son liquidadas por los curadores urbanos quienes las liquidan y
        expiden factura una vez el solicitante del trámite ha hecho los pagos. El cargo variable es un requisito de radicación (artículo 2.2.6.6.8.5) y el mismo no es objeto de
        reembolso.</p>
      <p className="text-justify">El liquidador es una herramienta para simular las expensas de los actos administrativos generados por la curaduría.</p>
      <p className="text-justify">Los valores resultado del uso de esta herramienta no reflejan bajo ningún criterio el valor final dado por la curaduría.</p>
      <p className="text-justify">Las consultas verbales sobre información general de las normas urbanísticas vigentes en el municipio o distrito no
        generarán expensas a favor del curador urbano. </p>
      <p className="text-justify">Dando cumplimiento al parágrafo 2 del artículo 2.2.6.6.8.3 del Decreto 1077 de 2015 se publica en la página WEB de la Curaduría Urbana Uno de Bucaramanga los
        costos de: el cargo fijo “Cf” y el cargo variable “CV”; expensas por otra actuación y las ecuación y tabla de los factores i y j para efectos de la liquidación de las
        expensas. Así mismo presenta un liquidador en el cual pueden simular el valor de las mismas.</p>
      <table className="table table-bordered table-sm table-hover text-start">
        <tbody>
          <tr className="bg-light text-center">
            <td><h4 className="text-justify fw-normal text-uppercase"></h4></td>
            <td><h4 className="text-justify fw-normal text-uppercase">$</h4></td>
            <td><h4 className="text-justify fw-normal text-uppercase">{values[version].units}</h4></td>
            <td><h4 className="text-justify fw-normal text-uppercase">Excepción</h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">
              {version == '2021' ? 'SMMLV' :
                version >= '2022' ? 'UVT' : ''}</h4></td>
            <td className="bg-light text-center"><h4 className="text-justify fw-normal text-uppercase">{getExpenses_m(1)}</h4></td>
            <td className="bg-light text-center"><h4 className="text-justify fw-normal text-uppercase">
              {version == '2021' ? '%100' :
                version >= '2022' ? '1' : ''}</h4></td>
            <td className="bg-light text-center" ><h4 className="text-justify fw-normal text-uppercase"></h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">Cargo fijo “Cf”</h4></td>
            <td className="bg-light text-center"><h4 className="text-justify fw-normal text-uppercase">{getExpenses_m(version == '2021' ? 0.4 : version >= '2022' ? 10.01 : 0)}</h4></td>
            <td className="bg-light text-center"><h4 className="text-justify fw-normal text-uppercase">
              {version == '2021' ? '%40' :
                version >= '2022' ? '10.01' : ''}</h4></td>
            <td className="bg-light text-center" ><h4 className="text-justify fw-normal text-uppercase">50% Sólo Adecuación</h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">Cargo variable “Cv”</h4></td>
            <td className="bg-light text-center"><h4 className="text-justify fw-normal text-uppercase">{getExpenses_m(version == '2021' ? 0.8 : version >= '2022' ? 20.02 : 0)}</h4></td>
            <td className="bg-light text-center"><h4 className="text-justify fw-normal text-uppercase">
              {version == '2021' ? '%80' :
                version >= '2022' ? '20.02' : ''}</h4></td>
            <td className="bg-light text-center" ><h4 className="text-justify fw-normal text-uppercase"></h4></td>
          </tr>
        </tbody>
      </table>
    </>

    let _note_2 = <ul>
      <li>ARTÍCULO 2.2.6.6.8.5 Radicación de las solicitudes de licencias.</li>
      <li>ARTÍCULO 2.2.6.6.8.6 Liquidación de las expensas para las licencias de urbanización y parcelación.</li>
      <li>ARTÍCULO 2.2.6.6.8.7 Liquidación de las expensas para las licencias de construcción.</li>
      <li>ARTÍCULO 2.2.6.6.8.8 Liquidación de las expensas para licencias simultáneas de urbanización, parcelación y construcción.</li>
      <li>ARTÍCULO 2.2.6.6.8.9 Liquidación de las expensas para licencias de urbanización y construcción por etapas.</li>
      <li>ARTÍCULO 2.2.6.6.8.10. Liquidación de las expensas para las modificaciones de licencias vigentes.</li>
      <li>DECRETO NÚMERO 1890 DE 2021, Ministerio de ciudad, vivienda y territorio: Por el cual se modifica parcialmente el Decreto 1077 de 2015 Único Reglamentarío del
        Sector Vivienda, Ciudad y Territorio, en lo relacionado con la reglamentación del artículo
        49 de la Ley 1955 de 2019 sobre las expensas por trámites ante los curadores urbanos </li>
    </ul>

    let _note_3 = <ul>
      <li>Correo electrónico curaduría curaduriaurbana1@gmail.com</li>
      <li>PQRS de esta página WEB. <Link to="/pqrs">www.curaduria1bucaramanga.com/pqrs</Link></li>
      <li>A través del móvil 3162795010</li>
      <li>Agendando su cita en esta pagina WEB.<Link to="/scheduling"> www.curaduria1bucaramanga.com/scheduling</Link></li>
      <li>También puede visitarnos en la calle 36 No 31-39 Local 101 Centro Empresarial Chicamocha.</li>
    </ul>

    let _note_4 = <>
      <p>Es el primero de ellos; está relacionado de una parte con las áreas construidas que aplica a las licencias de construcción en todas sus modalidades y de otra relacionado con las áreas brutas del predio objeto de licenciamiento y aplica a las licencias de parcelación y urbanismo.
      </p>
      <p>El valor final de la expensa resulta de aplicar la siguiente ecuación:</p>
      <table className="table table-bordered table-sm table-hover text-start">
        <tbody>
          <tr className="bg-light text-center">
            <td colSpan={'3'}><h4 className="text-justify fw-bold">E = (Cf * i * m) + (Cv * i * j* m)</h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">E</h4></td>
            <td colSpan={'2'} className="bg-light"><h4 className="fw-normal">Expresa el valor total de la expensa</h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">Cf</h4></td>
            <td colSpan={'2'} className="bg-light"><h4 className="fw-normal">Corresponde al cargo fijo</h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">Cv</h4></td>
            <td colSpan={'2'} className="bg-light"><h4 className="fw-normal">Corresponde al cargo variable</h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">i</h4></td>
            <td colSpan={'2'} className="bg-light"><h4 className="fw-normal">Expresa el uso y estrato o categoría en cualquier clase de suelo</h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">j</h4></td>
            <td colSpan={'2'} className="bg-light"><h4 className="fw-normal">Regula la relación entre el valor de las expensas y la cantidad de
              metros cuadrados objeto de la solicitud</h4></td>
          </tr>
          <tr>
            <td><h4 className="text-justify fw-bold">m</h4></td>
            <td colSpan={'2'} className="bg-light"><h4 className="fw-normal">Factor municipal. Para el caso de Bucaramanga éste es de 0,760</h4></td>
          </tr>
        </tbody>
      </table>
      <p>Los valores del factor “i” se aplica tanto al “Cf” como al “Cv”; está en
        función de los usos agrupados en vivienda y otros usos en el cual se
        encuentra: institucional, comercio e industrial. Para grupo de vivienda el
        factor “i” se asigna en función del estrato y para el grupo denominad
        otros usos, el factor se asigna en función de los m2 construidos tomando
        el nombre de Q que representa rangos de área construida.</p>
      <table className="table table-bordered table-sm table-hover text-start">
        <tbody>
          <tr className="bg-light text-center">
            <td><h4 className="text-justify fw-bold">Grupo de Uso</h4></td>
            <td><h4 className="text-justify fw-bold">Unidad</h4></td>
            <td><h4 className="text-justify fw-bold">Cantidad</h4></td>
            <td><h4 className="text-justify fw-bold">Valor</h4></td>
          </tr>
          <tr className='text-center'>
            <td rowSpan={'6'}><h4 className="text-center fw-bold">Vivienda</h4></td>
            <td rowSpan={'6'}><h4 className="text-center fw-normal">Estrato Socioeconómico</h4></td>
            <td><h4 className="fw-bold">1</h4></td>
            <td><h4 className="fw-bold">0,5</h4></td>
          </tr>
          <tr className='text-center'>
            <td><h4 className="fw-bold">2</h4></td>
            <td><h4 className="fw-bold">0,5</h4></td>
          </tr>
          <tr className='text-center'>
            <td><h4 className="fw-bold">3</h4></td>
            <td><h4 className="fw-bold">1</h4></td>
          </tr>
          <tr className='text-center'>
            <td><h4 className="fw-bold">4</h4></td>
            <td><h4 className="fw-bold">1,5</h4></td>
          </tr>
          <tr className='text-center'>
            <td><h4 className="fw-bold">5</h4></td>
            <td><h4 className="fw-bold">2</h4></td>
          </tr>
          <tr className='text-center'>
            <td><h4 className="fw-bold">6</h4></td>
            <td><h4 className="fw-bold">2,5</h4></td>
          </tr>
          <tr className='text-center'>
            <td rowSpan={'3'}><h4 className="text-center fw-bold">Otros Usos</h4></td>
            <td rowSpan={'3'}><h4 className="text-center fw-normal">Q = m2</h4></td>
            <td><h4 className="fw-bold">1 - 300 m2</h4></td>
            <td><h4 className="fw-bold">2,9</h4></td>
          </tr>
          <tr className='text-center'>
            <td><h4 className="fw-bold">301 - 1000 m2</h4></td>
            <td><h4 className="fw-bold">3,2</h4></td>
          </tr>
          <tr className='text-center'>
            <td><h4 className="fw-bold">Más de 1000 m2</h4></td>
            <td><h4 className="fw-bold">4,0</h4></td>
          </tr>
        </tbody>
      </table>

      <p>El factor “j” se aplica sólo al “Cv” está en función de los m2 a construir,
        ampliar o adecuar establecidos en Q para cada rango</p>
      <table className="table table-bordered table-sm table-hover text-start">
        <tbody>
          <tr className="bg-light text-center">
            <td><h4 className="text-justify fw-bold">Rango m2</h4></td>
            <td><h4 className="text-justify fw-bold">“j”</h4></td>
          </tr>
          <tr>
            <td><h4 className="fw-normal">Menor de 100m 2</h4></td>
            <td ><h4 className="fw-normal">j = 0,45</h4></td>
          </tr>
          <tr>
            <td><h4 className="fw-normal">Mayor a 100 m2 y Menor a 11000 0m2</h4></td>
            <td ><h4 className="fw-normal">j = 3,8 / ( 0,12 + (800/Q) )</h4></td>
          </tr>
          <tr>
            <td><h4 className="fw-normal">Mayor a 11000 m2</h4></td>
            <td ><h4 className="fw-normal">j = 2,2 / ( 0,018 + (800/Q) )</h4></td>
          </tr>
          <tr>
            <td><h4 className="fw-normal">Para Urbanismo y parcelación</h4></td>
            <td ><h4 className="fw-normal">j = 4 / ( 0,025 + (2000/Q) )</h4></td>
          </tr>
        </tbody>
      </table>
      <p>El factor “m” presenta un único valor para cada municipio el cual lo establece el
        Ministerio de Vivienda, ciudad y territorio; para el caso de Bucaramanga este es de
        0,760</p>
      <p>El costo calculado aquí es indicativo, pues el costo final depende de la liquidación oficial que se entregara con la viabilidad de la actuación; por tanto, el uso de esta herramienta y resultado que de ella haga el usuario no compromete a la Curaduría Urbana Uno de Bucaramanga. Inicialmente esta facilidad sólo calcula valores para las licencias de construcción y actos de reconocimiento de edificación existente
      </p>
      <p>El valor final de la expensa corresponde al resultado obtenido de aplicar la fórmula para el cobro por licencias y modalidades establecida en el artículo 2.2.6.6.8.3 del Decreto 0177 de 2015.</p>
    </>
    return (
      <div className="Liquidator">
        <div className="row py-4 d-flex justify-content-center">
          {useSelector
            ? <MDBBreadcrumb className="mx-5">
              <MDBBreadcrumbItem>
                <Link to={'/home'}><i class="fas fa-home"></i> <h4 className="text-uppercase">{breadCrums.bc_01}</h4></Link>
              </MDBBreadcrumbItem>
              <MDBBreadcrumbItem>
                <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <h4 className="text-uppercase">{breadCrums.bc_u1}</h4></Link>
              </MDBBreadcrumbItem>
              <MDBBreadcrumbItem active><i class="fas fa-calculator"></i> <h4 className="text-uppercase">{breadCrums.bc_u11}</h4></MDBBreadcrumbItem>
            </MDBBreadcrumb>
            : <MDBBreadcrumb className="mx-5">
              <MDBBreadcrumbItem>
                <Link to={'/home'}><i class="fas fa-home"></i> <h4 className="text-uppercase">{breadCrums.bc_01}</h4></Link>
              </MDBBreadcrumbItem>
              <MDBBreadcrumbItem active><i class="far fa-bookmark"></i> <h4 className="text-uppercase">{breadCrums.bc_51}</h4></MDBBreadcrumbItem>
            </MDBBreadcrumb>}

          <div className="col-lg-10">
            <h2 class="text-uppercase text-center pb-2" id='title'>{translation.title} {<Button_navigation Iddown={'title2'} Idup={null} />}</h2>
            <hr />
            {useSelector
              ? <div class="form-group my-2 col-4">
                <h4 for="exampleFormControlSelect1">VERSION DE LA CALCULADORA</h4>
                <select class="form-select" onChange={(e) => this.setState({ version: e.target.value })}
                  defaultValue={this.state.version}>
                  <option>2021</option>
                  <option>2022</option>
                  <option>2023</option>
                </select>
              </div>
              : ''}


            {hideInfo ? '' : <MDBTypography note style={{ backgroundColor: '#EDEDED' }}>
              <h3 className="text-justify text-dark" id='title2'>NOTA: Apreciado usuario, tenga en cuenta antes de usar esta herramienta: {<Button_navigation Iddown={'title3'} Idup={'title'} />}</h3>
              {_note_1}
            </MDBTypography>}

            <div className='row border border-dark bg-info py-2 text-center text-light app-p'>
              <div className='col' id='title3'> MODELO N°1: LICENCIAS QUE AUTORIZAN OBRAS {<Button_navigation Iddown={'title4'} Idup={'title2'} />}</div>
            </div>
            <MDBCard className="bg-card my-3">
              <MDBCardBody>
                <MDBRow>
                  <MDBCol md="6">
                    <h3 className="text-center">{translation.subTitle_1}</h3>
                    <hr />
                    <form onSubmit={handleSubmit} id="app-form">

                      <div class="input-group mb-3">
                        <span class="input-group-text bg-info text-white">
                          <i class="fas fa-home"></i>
                        </span>
                        <select class="form-select" id="project-liquidator" required onChange={e => this.setState({ type: e.target.value })}>
                          <option selected value="" disabled>{translation.form_project_0}</option>
                          <option value="0">{translation.form_project_1}</option>
                          <option value="1">{translation.form_project_2}</option>
                          <option value="2">{translation.form_project_3}</option>
                          <option value="3">{translation.form_project_4}</option>
                          <option value="4">{translation.form_project_5}</option>
                          <option value="5">{translation.form_project_6}</option>
                        </select>
                      </div>

                      <div class="input-group mb-3">
                        <span class="input-group-text bg-info text-white" >
                          <i class="fas fa-tasks"></i>
                        </span>
                        <select class="form-select" id="select_type" required >
                          <option selected value="" disabled>{translation.form_module_0}</option>
                          <option value="Obra Nueva" disabled={this.state.type == 2 ? true : false}>{translation.form_module_1}</option>
                          <option value="Ampliacion" disabled={this.state.type == 2 ? true : false}>{translation.form_module_2}</option>
                          <option value="Modificacion" disabled={this.state.type == 2 ? true : false}>{translation.form_module_3}</option>
                          <option value="Reforzamiento" disabled={this.state.type == 2 ? true : false}>{translation.form_module_4}</option>
                          <option value="Adecuacion (Con Obras)" disabled={this.state.type == 2 ? true : false}>{translation.form_module_5}</option>
                          <option value="Adecuacion (Sin Obras)" disabled={this.state.type == 2 ? true : false}>{translation.form_module_51}</option>
                          <option value="Demolicion total" disabled={this.state.type == 2 ? true : false}>{translation.form_module_6}</option>
                          <option value="Demolicion Parcial" disabled={this.state.type == 2 ? true : false}>{translation.form_module_7}</option>
                          <option value="Cerramiento" disabled={this.state.type == 2 ? true : false}>{translation.form_module_8}</option>
                          <option value="Restauracion" disabled={this.state.type == 2 ? true : false}>{translation.form_module_9}</option>
                          <option value="Reconstruccion" disabled={this.state.type == 2 ? true : false}>{translation.form_module_10}</option>
                          <option value="Reconocimiento">{translation.form_module_11}</option>
                        </select>
                      </div>

                      <div class="input-group mb-3">
                        <span class="input-group-text bg-info text-white" >
                          <i class="fas fa-home"></i>
                        </span>
                        <select class="form-select" id="use-liquidator" required
                          onChange={handleUse}>
                          <option selected value="" disabled>{translation.form_use_0}</option>
                          <option value="0">{translation.form_use_1}</option>
                          <option value="1">{translation.form_use_2}</option>
                        </select>
                      </div>

                      <div class="input-group mb-3">
                        <span class="input-group-text bg-info text-white">
                          <i class="fas fa-home"></i>
                        </span>
                        <select class="form-select" id="social-liquidator" required>
                          <option selected value="" disabled>{translation.form_social_0}</option>
                          <option value="0">{translation.form_social_1}</option>
                          <option value="1">{translation.form_social_2}</option>
                          <option value="2">{translation.form_social_3}</option>
                        </select>
                      </div>

                      <div class="input-group mb-3">
                        <span class="input-group-text bg-info text-white" >
                          <i class="fas fa-dollar-sign"></i>
                        </span>
                        <select class="form-select" id="strata-liquidator" required>
                          <option selected value="" disabled>{translation.form_strata_0}</option>
                          <option value="0">{translation.form_strata_1}</option>
                          <option value="1">{translation.form_strata_2}</option>
                          <option value="2">{translation.form_strata_3}</option>
                          <option value="3">{translation.form_strata_4}</option>
                          <option value="4">{translation.form_strata_5}</option>
                        </select>
                      </div>



                      <div class="input-group mb-3">
                        <span class="input-group-text bg-info text-white">
                          <i class="fas fa-cube"></i>
                        </span>
                        <input type="number" class="form-control" placeholder={translation.form_area} id="area-liquidator" min="0.01" step="0.01" />
                      </div>

                      <div className="text-center py-4 mt-3">
                        <button className="btn btn-lg btn-info">{translation.form_btn}</button>
                      </div>

                    </form>
                  </MDBCol>
                  <MDBCol md="6">
                    <h3 className="text-center" >{translation.subTitle_2}</h3>
                    <hr />
                    <table class="table">
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col">{translation.text_21}</th>
                          <th scope="col">{translation.text_22}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>{translation.text_23}</th>
                          <td><h4 className="lead">${formatNumber(Math.trunc(this.state.subtotal_cf))}</h4></td>
                          <td><h4 className="lead">${formatNumber(Math.trunc(this.state.subtotal_cv))}</h4></td>
                        </tr>
                        <tr>
                          <th>{translation.text_24}</th>
                          <td><h4 className="lead">${formatNumber(Math.trunc(this.state.subtotal_cf * iva))}</h4></td>
                          <td><h4 className="lead">${formatNumber(Math.trunc(this.state.subtotal_cv * iva))}</h4></td>
                        </tr>
                        <tr>
                          <th>{translation.text_25}</th>
                          <td><h4 className="lead">${formatNumber(Math.trunc(this.state.subtotal_cf * iva + this.state.subtotal_cf))}</h4></td>
                          <td><h4 className="lead">${formatNumber(Math.trunc(this.state.subtotal_cv * iva + this.state.subtotal_cv))}</h4></td>
                        </tr>
                        <tr>
                          <th>{translation.text_26}</th>
                          <td colSpan="2" className="text-center"><h4 className="lead">${formatNumber(Math.trunc(this.state.subtotal_cv * iva + this.state.subtotal_cv + Math.trunc(this.state.subtotal_cf * iva + this.state.subtotal_cf)))}</h4></td>
                        </tr>
                      </tbody>
                    </table>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
            <h2 class="text-uppercase text-center my-3" id='title4'>Tabla de Liquidacion  {<Button_navigation Iddown={'title5'} Idup={'title3'} />}</h2>
            {this.state.table.length > 0
              ? <>
                {_TABLE_INFO()}
                <div className="text-center py-4 mt-3">
                  <button className="btn btn-lg btn-secondary" onClick={() => this.setState({ table: [] })}>REINICIAR TABLA</button>
                </div>
              </>
              : <div className="text-center">No hay datos en la tabla</div>}
            {hideInfo ? '' : <MDBTypography notestyle={{ backgroundColor: '#EDEDED' }}>
              <h4 className="text-justify text-dark">NOTA: Para conocer el costo de las licencias de Urbanización , Subdivisión y Parcelación por favor acérquese a la Curaduría Urbana Uno de Bucaramanga o envié una
                solicitud a través de los siguientes canales:</h4>
              <Collapsible trigger={<><button className="btn btn-light btn-sm my-2">VER NOTAS</button></>}>
                {_note_3}
              </Collapsible>
              <h4 className="text-justify text-dark">NOTAS SOBRE EL VALOR DE LAS EXPENSAS</h4>
              <Collapsible trigger={<><button className="btn btn-light btn-sm my-2">VER NOTAS</button></>}>
                {_note_4}
              </Collapsible>
              <h4 className="text-justify text-dark">NOTAS SOBRE EXPENSAS Y FORMAS DE LIQUIDAR</h4>
              <Collapsible trigger={<><button className="btn btn-light btn-sm my-2">VER NOTAS</button></>}>
                {_note_2}
              </Collapsible>

            </MDBTypography>}

            <div className='row border border-dark bg-info py-2 text-center text-light app-p my-3'>
              <div className='col' id='title5'>MODELO N° 2 LICENCIAS QUE NO AUTORIZA OBRAS  {<Button_navigation Iddown={null} Idup={'title4'} />}</div>
            </div>

            <p>Este modelo; está relacionado con un rango de áreas y la aplicación de un porcentaje del {values[version].name} con excepción de un rango
              de reloteo que se liquida en días. Se aplica a las licencias de subdivisión y a las prórrogas y revalidaciones de licencia. Corresponde a un único
              pago al momento de la RADICACION.</p>
            <table className="table table-bordered table-sm table-hover text-start">
              <tbody>
                {model2Table.map(value => {
                  if (value.list) return <><tr className="bg-warning">
                    <td colSpan="2"><h4 className="text-justify fw-normal text-uppercase" >{value.title}</h4></td>
                    {console.log(value.Ids == undefined ? 'Id_1' : value.Ids)}
                    <td><h4 className="text-justify fw-normal text-uppercase">Expensas</h4></td>
                    <td><h4 className="text-justify fw-normal text-uppercase">IVA</h4></td>
                    <td><h4 className="text-justify fw-normal text-uppercase">Total</h4></td>
                  </tr>
                    {value.list.map(valuel => {
                      if (valuel.const[version]) return <tr>
                        <td><h4 className="text-justify fw-normal">{valuel.name}</h4></td>
                        <td><h4 className="text-justify fw-normal text-uppercase">
                          {valuel.const[version][1]
                            ? `(${valuel.const[version][2]}) ${valuel.const[version][1]}`
                            : `(${valuel.const[version][0]}) ${values[version].units} `
                          }</h4></td>
                        <td className='bg-info text-light'><h4 className="text-justify fw-normal text-uppercase">$ {getExpenses_m(valuel.const[version][0])}</h4></td>
                        <td className='bg-info text-light'><h4 className="text-justify fw-normal text-uppercase">$ {getIva_m(valuel.const[version][0])}</h4></td>
                        <td className='bg-info text-light'><h4 className="text-justify fw-normal text-uppercase">$ {getTotal_m(valuel.const[version][0])}</h4></td>
                      </tr>
                    })} </>
                  else return <tr className="bg-light">
                    <td colSpan="5"><h4 className="text-justify fw-normal text-uppercase">{value.title}</h4></td>
                  </tr>
                })}

              </tbody>
            </table>
            <h3 className='text-center'>Tabla de impuestos 2023</h3>
            <table className="table table-bordered table-sm table-hover text-center">
              <thead>
                <tr className='table-warning'>
                  <th>USO</th>
                  <th>ESTRATO</th>
                  <th>VALOR X M2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Residencial</td>
                  <td>1</td>
                  <td>$461</td>
                </tr>
                <tr>
                  <td>Residencial</td>
                  <td>2</td>
                  <td>$687</td>
                </tr>
                <tr>
                  <td>Residencial</td>
                  <td>3</td>
                  <td>$908</td>
                </tr>
                <tr>
                  <td>Residencial</td>
                  <td>4</td>
                  <td>$1.372</td>
                </tr>
                <tr>
                  <td>Residencial</td>
                  <td>5</td>
                  <td>$1.989</td>
                </tr>
                <tr>
                  <td>Residencial</td>
                  <td>6</td>
                  <td>$2.974</td>
                </tr>
                <tr>
                  <td>Industrial</td>
                  <td>7</td>
                  <td>$908</td>
                </tr>
                <tr>
                  <td>Comercio y servicios</td>
                  <td>8</td>
                  <td>$1.600</td>
                </tr>
                <tr>
                  <td>Institucional</td>
                  <td>9</td>
                  <td>$1.600</td>
                </tr>
                <tr>
                  <td>Area sub-urbana </td>
                  <td>10</td>
                  <td>$908</td>
                </tr>
                <tr>
                  <td>Area Rural</td>
                  <td>11</td>
                  <td>$461</td>
                </tr>
                <tr>
                  <td>Zona centro</td>
                  <td></td>
                  <td>$90</td>
                </tr>
                <tr>
                  <td>Zona norte</td>
                  <td></td>
                  <td>$182</td>
                </tr>
                <tr>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={3} className='text-center fw-bold'>Excavación del Subsuelo (10% de Delineación y Urbanismo - 5% en zonas centro y norte)</td>
                </tr>
                <tr>
                  <td colSpan={3} className='text-start'>VIS (25% de Delineación y Urbanismo)</td>
                </tr>
                <tr>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={3} className='text-center fw-bold'>IMPUESTO FONDO ROTATORIO PARA EL EMBELLECIMIENTO DEL ESPACIO URBANO</td>
                </tr>
                <tr>
                  <th>ZONA</th>
                  <th>ÁREA TOTAL CONSTRUCCIÓN</th>
                  <th>IMPUESTOS</th>
                </tr>
                <tr>
                  <td>EJE CARRERA 33</td>
                  <td>1.000 M²</td>
                  <td>el 60 % Impuestos</td>
                </tr>
                <tr>
                  <td>EJE CARRERA 27</td>
                  <td>2.500 M²</td>
                  <td>el 60 % Impuestos</td>
                </tr>
                <tr>
                  <td>EJE CARRERA 15 DIAGONAL</td>
                  <td>2.000 M²</td>
                  <td>el 60 % Impuestos</td>
                </tr>
                <tr>
                  <td>EJE LA ROSITA</td>
                  <td>3.000 M²</td>
                  <td>el 60 % Impuestos</td>
                </tr>
                <tr>
                  <td>BOULEVAR SANTANDER - BOLIVAR</td>
                  <td>2.000 M²</td>
                  <td>el 60 % Impuestos</td>
                </tr>
                <tr>
                  <td>AUTOPISTA FLORIDA</td>
                  <td>2.000 M²</td>
                  <td>el 60 % Impuestos</td>
                </tr>
                <tr>
                  <td>OTROS EJES Y DEMAS ZONAS DE LA CIUDAD</td>
                  <td>3.000 M²</td>
                  <td>el 60 % Impuestos</td>
                </tr>
                <tr>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={3} className='text-center fw-bold'>IMPUESTO ESTAMPILLA PRO -UIS</td>
                </tr>
                <tr>
                  <td className='fw-bold'>Estampilla Pro-Uis</td>
                  <td></td>
                  <td className='fw-bold'>Valor</td>
                </tr>
                <tr>
                  <td>Estrato 1 y 2</td>
                  <td></td>
                  <td>No Aplica</td>
                </tr>
                <tr>
                  <td>Estrato 3 y 4</td>
                  <td>Por M²</td>
                  <td>$ 1.160</td>
                </tr>
                <tr>
                  <td>Estrato 5 y 6</td>
                  <td>Por M²</td>
                  <td>$ 2.320</td>
                </tr>
                <tr>
                  <td colSpan={3}>Estrato 3 y 4 el 1/1000 del SMLM, Estrato 5 y 6 el 2/1000</td>
                </tr>
                <tr>
                  <td>Estampilla de Previsión Social Municipal</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3}> Estampillas Caja de Previsión Social Municipal - No se recauda estampilla, según Resolución 659 de 2015</td>
                </tr>

                <tr>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={3} className='text-center fw-bold'>Nomenclaturas</td>
                </tr>
                <tr>
                  <td>Impuestos</td>
                  <td></td>
                  <td>$42.412</td>
                </tr>
              </tbody>
            </table>
            {hideInfo ? '' :
              <MDBTypography note style={{ backgroundColor: '#EDEDED' }}>
                <h3 className="text-justify text-dark">Nota: Decreto 1077 de 2015</h3>
                <p className="text-justify">Artículo 2.2.6.6.8.12. Expensas en los casos de expedición de licencias de construcción individual de vivienda de interés social. Modificado por el art. 7, Decreto Nacional 1100 de 2008. Las solicitudes de licencia de construcción individual de vivienda de interés social unifamiliar o bifamiliar en los estratos 1, 2 y 3, generarán en favor del curador una expensa única equivalente a cinco (5) salarios mínimos diarios legales vigentes al momento de la radicación por cada unidad de vivienda. En estos casos no se aplicará lo dispuesto en el artículo 11 de la Ley 810 de 2003.</p>
                <h3 className="text-justify text-dark">Nota: Decreto 1890 de 2021</h3>
                <p className="text-justify"> Ministerio de ciudad, vivienda y territorio: Por el cual se modifica parcialmente el Decreto 1077 de 2015 Único Reglamentarío del
                  Sector Vivienda, Ciudad y Territorio, en lo relacionado con la reglamentación del artículo
                  49 de la Ley 1955 de 2019 sobre las expensas por trámites ante los curadores urbanos.</p>
              </MDBTypography>}
          </div >
        </div >
      </div >
    );
  }
}

export default Liquidator;