
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
		debelPacient = false;
		return "Trpite za podhranjenostjo";
	}
	if(BMI > 18.5 && BMI <= 25){
		debelPacient = false;
		return "Imate normalen BMI";
	}
	if(BMI > 25 && BMI <= 30){
		debelPacient = true;
		return "Imate povečano telesno maso";
	}
	if(BMI > 30 && BMI <= 40){
		debelPacient = true;
		return "Trpite za debelostjo";
	}
	if(BMI > 40){
		debelPacient = true;
		return "Trpite za hudo debelostjo";
	}
}

var pacienti = [
			{id: 1, ime: "Janez Novak", visina: 170, teza:80, temperatura:36.6, sisTlak:120, diasTlak:60, ehrId : ""},
			{id: 2, ime: "Lojze Zelenko", visina: 170, teza:60, temperatura:42.0, sisTlak:150, diasTlak:90, ehrId : ""},
			{id: 3, ime: "Ivan Grozni", visina: 150, teza:100, temperatura:36.6, sisTlak:120, diasTlak:90, ehrId : ""}
];

var debelPacient = false;
var bolanPacient = false;
var najblizjaBolnica = -1;
var globalX = 0;
var globalY = 0;

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
		bolanPacient = false;
		return rezultatZdrav;
	}
	bolanPacient = true;
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
	grafHeader.innerHTML = "<h3 align='center'>Vizualizacija vitalnih znakov</h3>";

	if(bolanPacient){
		mapHeader.innerHTML = "<hr><h3 align='center'>Napotki za zdravljenje</h3>";
	}
	

	var zdravjediv = document.getElementById('zdravje');
	var pokazatelj = preveriZdravje(temp, sisTlak, diasTlak);
	if(pokazatelj.startsWith('Super')){
		zdravjediv.innerHTML = "<div align='center' class='alert alert-success'>"+pokazatelj+"</div>";
	}else {
		zdravjediv.innerHTML = "<div align='center' class='alert alert-danger'>"+pokazatelj+"</div>";
	}

	var skrito = true;
	var zdravjeDetail = document.getElementById('zdravjeDetail');
	zdravjediv.addEventListener("click", function(){
		if(skrito){
	    	zdravjeDetail.innerHTML = "<div align='center' class='alert alert-info'>"+
	    	"Vaša temperatura: <strong>"+temp+"</strong> | Normalna temperatura: <strong>36,6</strong><br>"+
	    	"Vaš sistolični krvni tlak: <strong>"+sisTlak+"</strong> | Običajna meja: <strong>110 - 140</strong><br>"+
	    	"Vaš diastolični krvni tlak: <strong>"+diasTlak+"</strong> | Običajna meja: <strong>60 - 90</strong></div>";
	    	skrito = false;
	    } else{
	    	zdravjeDetail.innerHTML = "";
	    	skrito = true;
	    }
	});
	
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
	readTextFile("bolnice.json");

}
var obj;

function readTextFile(file){
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status == 0)
			{
				var allText = rawFile.responseText;
				obj = JSON.parse(allText);
				mx = parseFloat(obj.bolnice[7].lat);
				my = parseFloat(obj.bolnice[7].lng);
				console.log(mx+" : "+my);
				initMap(mx,my);
				getLocation();
				initMarker(obj);
				
			}
		}
	}
	rawFile.send(null);
}

var openFile = function(event) {
		var input = event.target;

		var reader = new FileReader();
		reader.onload = function(){
		  var text = reader.result;
		  var node = document.getElementById('output');
		  node.innerText = text;
		  console.log(reader.result.substring(0, 200));
		};
		reader.readAsText(input.files[0]);
};

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	}
}

function showPosition(position) {
	var x = position.coords.latitude;
	var y = position.coords.longitude;
	globalX = x;
	globalY = y;
	var LatLng = new google.maps.LatLng(x,y);
	map.setCenter(LatLng);
	initMarkerLocation(LatLng);
	var closest = najdiNajblizjoBolnico(obj);
	driveInstructions(LatLng, closest);
}

function driveInstructions(start, dest){
	var directions = new google.maps.DirectionsRenderer({
		map: map
	});
	var request = {
		destination: dest,
		origin: start,
		travelMode: google.maps.TravelMode.DRIVING
	};
	var directService = new google.maps.DirectionsService();
	directService.route(request, function(response, status){
		if(status == google.maps.DirectionsStatus.OK){
			directions.setDirections(response);
		}
	});
}



function initMarker(obj){
	for(var i = 0; i < obj.bolnice.length; i++){
		var x = obj.bolnice[i].lat;
		var y = obj.bolnice[i].lng;
		var location = new google.maps.LatLng(x,y);
		marker = new google.maps.Marker({
			position: location,
			map: map,
			title: obj.bolnice[i].ime
		});
	}
}

function initMarkerLocation(latlng){
	var image = 'myPosition-small.png';
	marker = new google.maps.Marker({
		position: latlng,
		map:map,
		icon: image,
		title: "Your location!"
	});
}

var map;
function initMap(x,y) {
	console.log("LOG: "+x+", "+y);
	var location = new google.maps.LatLng(x,y);
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 14,
		center: location
	});
}

function rad(x){
	return x*Math.PI/180;
}

function najdiNajblizjoBolnico(obj){
	var R = 6371;
	var distances = [];
	var x = globalX;
	var y = globalY;

	for(var i = 0; i < obj.bolnice.length;i++){
		var mlat = obj.bolnice[i].lat;
		var mlng = obj.bolnice[i].lng;
		var dLat = rad(mlat-x);
		var dLong = rad(mlng-y);
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(rad(x)) * Math.cos(rad(x)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        distances[i] = d;
        if ( najblizjaBolnica == -1 || d < distances[najblizjaBolnica] ) {
            najblizjaBolnica = i;
        }
    }
	//alert(obj.bolnice[najblizjaBolnica].ime);
	return new google.maps.LatLng(obj.bolnice[najblizjaBolnica].lat, obj.bolnice[najblizjaBolnica].lng);
}