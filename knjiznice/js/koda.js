
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
	if(BMI <= 18.5){
		return "podhranjenost";
	}
	if(BMI > 18.5 && BMI <= 25){
		return "normalno";
	}
	if(BMI > 25 && BMI <= 30){
		return "povečana telesna masa";
	}
	if(BMI > 30 && BMI <= 40){
		return "debelost";
	}
	if(BMI > 40){
		return "huda debelost";
	}
}

var pacienti = [
			{id: 1, ime: "Janez Novak", visina: 170, teza:80, temperatura:36.6, sisTlak:120, diasTlak:90, ehrId : ""},
			{id: 2, ime: "Lojze Zelenko", visina: 170, teza:60, temperatura:42.0, sisTlak:120, diasTlak:90, ehrId : ""},
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


function narisiGrafe(){
	var id = document.getElementById('sel1').value;
	var temp = pacienti[id].temperatura;
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
}