
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function izvediLogiko(){
	//preveri znake in jih vpiši
	//narisi graf
	//narisi zemljevid
	//dobi najblizjo lokacijo
	//narisi najblizjo bolnico
}

function racunajBMI(teza, visina){
	visina = visina/100;
	var BMI = (teza)/(visina*visina);
	return BMI;
}
function povejBMIKat(BMI){
	if(BMI <= 18.5){
		return "Trpite za podhranjenostjo";
	}
	if(BMI > 18.5 && BMI <= 25){
		return "Imate normalen BMI";
	}
	if(BMI > 25 && BMI <= 30){
		return "Imate povečano telesno maso";
	}
	if(BMI > 30 && BMI <= 40){
		return "Trpite za debelostjo";
	}
	if(BMI > 40){
		return "Trpite za hudo debelostjo";
	}
}

var pacienti = [
			{id: 1, ime: "Janez Novak", visina: 170, teza:80, temperatura:36.6, sisTlak:120, diasTlak:60, ehrId : ""},
			{id: 2, ime: "Lojze Zelenko", visina: 170, teza:60, temperatura:42.0, sisTlak:150, diasTlak:90, ehrId : ""},
			{id: 3, ime: "Ivan Grozni", visina: 150, teza:100, temperatura:36.6, sisTlak:120, diasTlak:90, ehrId : ""}
];

/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
	var response = $.ajax({
		type: "POST",
		url: baseUrl + "/session?username=" + encodeURIComponent(username) +
				"&password=" + encodeURIComponent(password),
		async: false
	});
	return response.responseJSON.sessionId;
}
/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

 function generate(){
 	for(var i = 0; i < 3; i++){
 		generirajPodatke(i);
 	}
 }



function generirajPodatke(stPacienta) {
	var seja = getSessionId();
	var ehrId = "";
	$.ajaxSetup({
		headers: {"Ehr-Session" : seja}
	});
	$.ajax({
		url: baseUrl + "/ehr",
		type: "POST",
		success: function(data){
			ehrId = data.ehrId;
			nameArray = pacienti[stPacienta].ime.split(' ');
			var partyData = {
				firstNames: nameArray[0],
				lastNames: nameArray[1],
				dateOfBirth: 0,
				partyAdditionalInfo: [{key: "ehrId", value:ehrId}] 
			};

			$.ajax({
				url: baseUrl + "/demographics/party",
				type:"POST",
				contentType: "application/json",
				data: JSON.stringify(partyData),
				success: function(party){
					alert("dodano!\nIme: "+pacienti[stPacienta].ime+"\nID: "+ehrId);
					pacienti[stPacienta].ehrId = ehrId;
				},
				error: function(err){
					alert("Napaka!");
				}
			});


		}




	});

	
	

	// TODO: Potrebno implementirati

	return ehrId;
}

//vrne EhrId za izbranega pacienta
function vrniIdZaIzbranega(){
	var select = document.getElementById('sel1');
	var id = select.value;
	return pacienti[id].ehrId;
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

function preveriZdravje(temp, sisTlak, diasTlak){
	var rezultatZdrav = "Super! Vaši vitalni znaki kažejo, da ste zdravi!";
	var rezultatBolan = "";
	var zdrav = true;
	if(temp > 37 || temp < 36){
		rezultatBolan += "Vaša telesna temperatura je previsoka!<br>";
		zdrav = false;
	}
	if(sisTlak < 110 || sisTlak > 140){
		zdrav = false;
		rezultatBolan += "Vaš sistolični krvni tlak je ";
		if(sisTlak < 110){
			rezultatBolan += "prenizek!<br>";
		} else {
			rezultatBolan += "previsok!<br>";
		}
	}
	if(diasTlak < 60 || diasTlak > 90){
		zdrav = false;
		rezultatBolan += "Vaš diastolični krvni tlak je ";
		if(diasTlak < 60){
			rezultatBolan += "prenizek! ";
		} else {
			rezultatBolan += "previsok! ";
		}
	}	
	if(zdrav){
		return rezultatZdrav;
	}
	return rezultatBolan;
}


function narisiGrafe(){
	var id = document.getElementById('sel1').value;
	var temp = pacienti[id].temperatura;
	var sisTlak = pacienti[id].sisTlak;
	var diasTlak = pacienti[id].diasTlak;
	var teza = pacienti[id].teza;
	var visina = pacienti[id].visina;
	var bmi = racunajBMI(teza, visina).toFixed(2);
	var BMIkat = povejBMIKat(bmi);

	var mapHeader = document.getElementById('mapHeader');
	var grafHeader = document.getElementById('grafHeader');
	mapHeader.innerHTML = "<hr><h3 align='center'>Napotki za zdravljenje</h3>";
	grafHeader.innerHTML = "<h3 align='center'>Vizualizacija vitalnih znakov</h3>";

	var zdravjediv = document.getElementById('zdravje');
	var pokazatelj = preveriZdravje(temp, sisTlak, diasTlak);
	if(pokazatelj.startsWith('Super')){
		zdravjediv.innerHTML = "<div align='center' class='alert alert-success'>"+pokazatelj+"</div>";
	}else {
		zdravjediv.innerHTML = "<div align='center' class='alert alert-danger'>"+pokazatelj+"</div>";
	}
	


	var bmidiv = document.getElementById('bmi');
	bmidiv.innerHTML = "<div align='center' class='well'>Vaš BMI (Indeks telesne mase) je: <strong>"+bmi+"</strong> - "+BMIkat+".</div>";


	var prvigraf = document.getElementById('prvigraf').innerHTML = "<h4 align='center'>Telesna temperatura</h4>";
 	google.charts.setOnLoadCallback(drawChart);
    function drawChart() {

    	var data = google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          ['°C', temp]
        ]);

        var options = {
          width: 600, height: 180,
          redFrom: 38, redTo: 60,
          yellowFrom:37, yellowTo: 38,
          minorTicks: 10,
          min: 30,
          max: 50
        };

        var chart = new google.visualization.Gauge(document.getElementById('chart_div'));

        chart.draw(data, options);
				//data.setValue(0,1,30);
        //chart.draw(data, options);
    }
    var drugigraf = document.getElementById('drugigraf').innerHTML = "<h4 align='center'>Krvni pritisk</h4>";
    google.charts.setOnLoadCallback(drawBasic);
	function drawBasic() {
			  var data = google.visualization.arrayToDataTable([
				['vrsta', 'vaša meritev', 'priporočena vrednost'],
				['Sistolični', sisTlak,120],
				['Diastolični', diasTlak,90]
			  ]);
			  var options = {
				
				chartArea: {width: '50%'},
				hAxis: {
				  minValue: 0
				},
				colors:['red','green']
			  };
			  var chart = new google.visualization.BarChart(document.getElementById('chart_div2'));
			  chart.draw(data, options);
	}


}

