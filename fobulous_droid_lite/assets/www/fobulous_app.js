var foursquareClientId = "AKLI4QH4UGFRMZ0AJS1RAIDAKWLUWVEQUM540BHYERP2YYSK";
var foursquareClientSecret = "MYYSQL20MOLAVHF2U1RRNLLTFSX1UCPZ2ILCD3LYQO54ZXEM";

var onGeoSuccess = function(position) {
    alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + new Date(position.timestamp)      + '\n');
    
    $.post("https://api.foursquare.com/v2/venues/search?ll="+position.coords.latitude+","+position.coords.longitude+"&client_id="+foursquareClientId+"&client_secret="+foursquareClientSecret+"&v=20120316")
    .success(function(data) { 
             alert(data);
             })
    .error(function(data) { alert("error"+data.toSource); })
    .complete(function() {    
              //$.mobile.changePage("http://emergenconline.com/?mobilePage=home");
              });
};

// onError Callback receives a PositionError object
//
var onGeoFail = function(error) {
    alert('Failed to get geolocation');
}


function onBodyLoad() {
    document.addEventListener("deviceready",onDeviceReady,false);
}

function onDeviceReady() {
    $.mobile.ajaxEnabled = true;
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    
    //window.addEventListener("orientationchange", onOrientationChange, false);
    if(gooAnal){
    var googleAnalytics = window.plugins.googleAnalyticsPlugin;
    googleAnalytics.startTrackerWithAccountID(gooAnal);
    googleAnalytics.trackPageview(gooAnalPath);
    }

    if (useLocation) navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFail);
    
    if (useBanner){
        window.addEventListener("orientationchange", window.plugins.iAdPlugin.orientationChanged, false);
        window.plugins.iAdPlugin.orientationChanged(true);
        window.plugins.iAdPlugin.showAd(true);
        document.addEventListener("iAdBannerViewDidLoadAdEvent", iAdBannerViewDidLoadAdEventHandler, false);
        document.addEventListener("iAdBannerViewDidFailToReceiveAdWithErrorEvent",iAdBannerViewDidFailToReceiveAdWithErrorEventHandler, false);
        var adAtBottom = true; 
        setTimeout(function() {window.plugins.iAdPlugin.prepare(adAtBottom);}, 1000);
    }
    
    //document.addEventListener("touchmove", preventBehavior, false);
    
    //window.plugins.applicationPreferences.set('name_identifier','homer', function() {
    //                                          alert("It is saved");
    //                                          }, function(error) {
    //                                          alert("Failed to retrieve a setting: " + error);
    //                                          }
    //                                          );
    
    var db = window.openDatabase(dbName,version,tableName,tableSize);
    db.transaction(initDB, errorCB, successCB);
    
}

function onOrientationChange()
{
    //alert(window.orientation);
}

function initDB(tx) { 
    tx.executeSql('CREATE TABLE IF NOT EXISTS ENTRIES (id INTEGER PRIMARY KEY ASC, data, name, format, date, position, location)');
} 

function deleteDB(tx) {
	tx.executeSql('DELETE FROM ENTRIES WHERE id ='+(deleteID), [], deleteSuccess, errorCB);
} 

function insertRow(tx) {
	if (resultSet.format == 'UPC_A'){ resultSet.text = pad(resultSet.text,13)}
	tx.executeSql('INSERT INTO ENTRIES (data, name, format, date) VALUES ("'+resultSet.text+'","'+$('#bcNameInput').val()+'","'+resultSet.format+'",DATETIME("NOW"))');
	window.location = '#main';
    document.getElementById('bcList').innerHTML='';
    $('#bcDataInput').val('');  
    document.getElementById('bcDataInputDup').innerHTML='';
    $('#bcNameInput').val('');  
    var db = window.openDatabase(dbName,version,tableName,tableSize);
    db.transaction(initDB, errorCB, successCB);
}

function deleteSuccess(tx, results) {
	window.location = '#main';
    document.getElementById('bcList').innerHTML='';
    var db = window.openDatabase(dbName,version,tableName,tableSize);
    db.transaction(initDB, errorCB, successCB);
}

function queryDB(tx) {
	tx.executeSql('SELECT * FROM ENTRIES', [], querySuccess, errorCB);
} 

function querySuccess(tx, results) {
	dbIndex = results.rows.length;
	if (dbIndex > 0) {
        document.getElementById('bcList').innerHTML='';
		for (var i = 0; i < dbIndex; i++) {
            document.getElementById('bcList').innerHTML += '<li><a href="#barcode" onclick="setBCData('+results.rows.item(i).id+',\''+results.rows.item(i).data+'\',\''+results.rows.item(i).name+'\',\''+results.rows.item(i).format+'\')" data-transition="slide">' + results.rows.item(i).name + '</a></li>';
		}
		
		$('#loader').remove();
		$('#bcList').listview("refresh");
	}
    if (dbLimit){
        if (dbIndex >= dbLimit){
            $('#addButton').hide();
        }
    }
}

function errorCB(err) {
	alert("Error processing SQL: " + err.code + " " + err.message);
    console.log("Error processing SQL: " + err.code + " " + err.message);
} 

function successCB() {
	var db = window.openDatabase(dbName,version,tableName,tableSize);
	db.transaction(queryDB, errorCB);
}

function insertData(name) {
    if ($('#bcDataInput').val() == '') { 
        alert('Please scan your item');
        return true; 
    }
    if ($('#bcNameInput').val() == '') { 
        bgName = 'no name';
    } else {
        bgName = name;
	}
    var db = window.openDatabase(dbName,version,tableName,tableSize);
	db.transaction(insertRow, errorCB);
}

function deleteData(id) {
    deleteID = id;
	var db = window.openDatabase(dbName,version,tableName,tableSize);
	db.transaction(deleteDB, errorCB);
}

function pad(number, length) {
    
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    
    return str;
    
}

function scanFob() {
    try {
        window.plugins.barcodeScanner.scan(scannerSuccess, scannerFailure)
    }
    catch (e) {
        alert("exception scanning: " + e)
    }
}

function scannerSuccess(result) {
    if (result.cancelled) {
        //alert("cancelled")
        return
    }
    resultSet = result
    $("scan-button").val("Rescan");
    document.getElementById('bcDataInputDup').innerHTML = "<img src='images/accept.png'> "+result.text; 
    $('#bcDataInput').val(result.text);  
}


function encoderSuccess(result) {
    //alert("scanner returned: " + JSON.stringify(result))
	if (result.cancelled) {
        scannerFailure("cancelled")
        return
    }
}


function scannerFailure(message) {
    //console.log("BarcodeScanner failure: " + message)
	//alert("BarcodeScanner failure: " + message)
}

function setBCData(id,data,name,format) {
    var codeFormat;
    switch(format){
        case 'EAN_13':
            codeFormat = 'ean13';
            break;
        case 'CODE_39':
            codeFormat = 'code39';
            break;
        case 'CODABAR':
            codeFormat = 'codabar';
            break;
        case 'CODE_93':
            codeFormat = 'code93';
            break;
        case 'CODE_128':
            codeFormat = 'code128';
            break;
        case 'EAN_8':
            codeFormat = 'ean8';
            break;
        case 'STD_25':
            codeFormat = 'std25';
            break;
        case 'INT_25':
            codeFormat = 'int25';
            break;
        case 'MSI':
            codeFormat = 'msi';
            break;
        case 'DATA_MATRIX':
            codeFormat = 'datamatrix';
            break;
        default:
            codeFormat = 'ean13';
    }
    
    $("#deleteButton").click(function() {
                             deleteData(id);
                             });    
    $("#bcName").html('<b>'+name+'</b>');
    $("#bcFormat").html(' ('+format+')');
    $("#bcTarget").barcode(data,codeFormat,{barWidth:2, barHeight:150, fontSize:16,moduleSize:10});
}




;jQuery.extend({
	parseQuerystring: function(){
		var nvpair = {};
               alert(window.location);
		var qs = window.location.search.replace('?', '');
               alert(qs);
		var pairs = qs.split('&');
		$.each(pairs, function(i, v){
			var pair = v.split('=');
			nvpair[pair[0]] = pair[1];
		});
		return nvpair;
	}
});

