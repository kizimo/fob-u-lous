function onBodyLoad() {
    document.addEventListener("deviceready",onDeviceReady,false);
}

function onDeviceReady() {
    $.mobile.ajaxEnabled = true;
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    
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
    count = 0;
	if (dbIndex > 0) {
        document.getElementById('bcList').innerHTML='';
		for (var i = 0; i < dbIndex; i++) {
            document.getElementById('bcList').innerHTML += '<li><a href="#barcode" onclick="setBCData('+results.rows.item(i).id+',\''+results.rows.item(i).data+'\',\''+results.rows.item(i).name+'\',\''+results.rows.item(i).format+'\')" data-transition="slide">' + results.rows.item(i).name + '</a></li>';
            count++;
		}
		
		$('#loader').remove();
		$('#bcList').listview("refresh");
	}
    if (dbLimit){
        if (count >= dbLimit){
            $('#addButton').hide();
        } else {
             $('#addButton').show();
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
        //alert("exception scanning: " + e)
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

function iAdBannerViewDidFailToReceiveAdWithErrorEventHandler(evt)
{
    alert(evt.error);
    window.plugins.iAdPlugin.showAd(false);
    var elem = document.getElementById("showAd");
    elem.checked = false;
}

function iAdBannerViewDidLoadAdEventHandler(evt)
{
    // if we got this event, a new ad is loaded
    var elem = document.getElementById("lastAdLoaded");
    gLastAdLoadedDate = new Date();
    elem.innerHTML = gLastAdLoadedDate.toLocaleString();
    
    elem = document.getElementById("showAd");
    elem.disabled = false;
    elem.checked = true;
    window.plugins.iAdPlugin.showAd(true);
    
    gTotalAdsLoaded++;
    
    elem = document.getElementById("totalAdsLoaded");
    elem.innerHTML = gTotalAdsLoaded.toString();
    
    if (gTimerId) {
        clearInterval(gTimerId);
    }
    gTimerId = setInterval(lastAdLoadedInterval, 1000);
    
}

function lastAdLoadedInterval()
{
    var now = (new Date()).getTime();
    var diff = now - gLastAdLoadedDate.getTime();
    var elem = document.getElementById("lastAdLoaded");
    
    var ms_in_a_year = 31449600000; /* 1000ms x 60s x 60m x 24hrs x 7d x 52w */
    var ms_in_a_week = 604800000; /* 1000ms x 60s x 60m x 24hrs * 7d */
    var ms_in_a_day = 86400000; /* 1000ms x 60s x 60m x 24hrs */
    var ms_in_an_hour = 3600000; /* 1000ms x 60s x 60m */ 
    var ms_in_a_minute = 60000; /* 1000ms x 60s */ 
    var ms_in_a_second = 1000;		
    
    var milliseconds = Math.floor(diff);
    var seconds = Math.floor(milliseconds / ms_in_a_second) % 60;
    var minutes = Math.floor(milliseconds / ms_in_a_minute) % 60;
    var hours = Math.floor(milliseconds / ms_in_an_hour) % 24;
    var days = Math.floor(milliseconds / ms_in_a_day) % 7;
    var weeks = Math.floor(milliseconds / ms_in_a_week) % 52;
    var years = Math.floor(milliseconds / ms_in_a_year);
    
    var caption = seconds + "s ago";
    
    if (minutes > 0) {
        caption = minutes + "m " + caption;
    }
    if (hours > 0) {
        caption = hours + "h " + caption;
    } 
    if (days > 0) {
        caption = days + "d " + caption;
    } 
    if (weeks > 0) {
        caption = weeks + "w " + caption;
    } 
    if (years > 0) {
        caption = years + "yr " + caption;
    } 
    
    elem.innerHTML = caption;
}

function showAdClicked(evt)
{
    window.plugins.iAdPlugin.showAd(evt.checked);
}

//function preventBehavior(e) { 
//    e.preventDefault(); 
//}


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

