var g_productList = [];
var g_orderList = [];
var g_result = [];
var g_UserId;
var g_SaleManCode;
var g_Location;
var g_OrderFile;//Order File to Open from device.
var g_FileList = [];
var g_currentfileName;
var g_currentStockName;
var g_currentImageData;
var g_tempStockName;
var g_tempOrderNum;
var g_bEdit = false;
var g_editNum;

var LoginPage = 0, SetupPage = 1, ProductPage = 2, OverviewPage = 3;
var g_currentPage = LoginPage;

var fileSystem;
var bUseSDCard = false;

document.addEventListener("deviceready", onDeviceReady, false);

$(document).ready(function(){
	/*g_productList.push ({
		addAmt: item[userid].addAmt,
	});*/
	//alert(g_productList.length);
});

$('#product_overview #barcode').live('keyup', function(event){
	if(event.keyCode == 13){
		showProduct();
	}
});
function showProduct() {
	g_result = [];
	var name = $("#product_overview #barcode").val().toLowerCase();
	if(name.length < 1) {
		alert("There is no product!");
		$("#product_overview #barcode").focus();
		return ;
	}
	for(i=0;i<g_productList.length;i++) {
		var product = g_productList[i];
		currentStockName = product.STOCK;
		currentStockName = currentStockName.toLowerCase();
		if(currentStockName.indexOf(name) != -1) {
			g_result.push({
				barcode: product.BARCODE,
				stock: currentStockName,
				description :product.DESCRIPTION
			});
			continue;
		}		
		
		barcode = String(product.BARCODE);
		if(barcode.indexOf(name) != -1) {
			g_result.push({
				barcode: product.BARCODE,
				stock: product.STOCK,
				description :product.DESCRIPTION
			});	
		}
	}
	if(g_result.length < 1) {
		alert("There is no product!");
		$("#product_overview #barcode").focus();
		return ;
	}
	$.mobile.changePage($("#result"));
	return;
	//alert(scancode);
	
	//This is test code
	//g_Barcode = "1000000097399";
	g_Barcode = scancode;
	var bflag = false;
	for(i=0;i<g_productList.length;i++) {
		var product = g_productList[i];
		g_currentStockName = product.STOCK;
		if(g_Barcode == product.BARCODE) {
			bflag = true;
			$("#product #barcode").html(product.BARCODE);
			$("#product #price").html(product.NETTPRICE);
			$("#product #model").html(product.STOCK);
			$("#product #glass").html(product.GLASS);
			$("#product #base").html(product.BASE);
			$("#product #lamps").html(product.LAMPS);
			$("#product #ballast").html(product.BALLAST);
			$("#product #region").html(product.REGION);
			$("#product #description").val(product.DESCRIPTION);
			
			filename = "file:///mnt/sdcard/stock/" + g_currentStockName + ".JPG";
			document.getElementById("product_img").src = filename;
			document.getElementById("popupimg").src = filename;			
			
			localStorage.setItem("product", JSON.stringify(product));
			localStorage.setItem("productid", i);
			$.mobile.changePage($("#product"));
		}
	}
	if(bflag == false)
		alert("There is no product!");
}


function onFSSuccess(fs) {
	fileSystem = fs;
	ReadProductList();
}

function onDeviceReady() {
	$("#popupPhoto").popup();
	$.mobile.showPageLoadingMsg();
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, fail);
	//checkIfFileExists();
}

function ReadProductList() {
	fileSystem.root.getFile("saleman/data.txt", null, gotFileEntry, fail);
}

function gotFileEntry(fileEntry) {
    fileEntry.file(gotFile, fail);
}

function gotFile(file){
    readAsText(file);
}

function readAsText(file) {
	 $.mobile.hidePageLoadingMsg();
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        //alert(evt.target.result);
        var string = evt.target.result;
        //alert(string);
        var products = JSON.parse(string);
        //alert(products);
        g_productList = products;
       
        //alert(g_productList.length);
        //openOrder("example1.txt");
    };
    reader.readAsText(file);
}

function fail(evt) {
	 $.mobile.hidePageLoadingMsg();
    console.log(evt.target.error.code);
}

function ShowOverview() {
	$.mobile.changePage($("#product_overview"));
}

function RemoveOrder() {
	if (confirm('Are you sure to remove all orders?')) {

    }else {
    	return ;
    }
	
	if(bUseSDCard == true) {
		fileSystem.root.getDirectory("file:///mnt/sdcard1/saleman/orders", {create: true}, getDirSuccessForOrders, fail);
		fileSystem.root.getDirectory("file:///mnt/sdcard1/saleman/toserver", {create: true}, getDirSuccessForServer, fail);	
	}else {
		fileSystem.root.getDirectory("saleman/orders", {create: true}, getDirSuccessForOrders, fail);
		fileSystem.root.getDirectory("saleman/toserver", {create: true}, getDirSuccessForServer, fail);	
	}
	
}

function getDirSuccessForOrders(dirEntry) {
	// Get a directory reader
    //var directoryReader = dirEntry.createReader();
    // Get a list of all the entries in the directory
    //directoryReader.readEntries(readerSuccessForOrders,fail);
	
    dirEntry.removeRecursively(success1, fail);
}

function getDirSuccessForServer(dirEntry) {
	dirEntry.removeRecursively(success2, fail);
}

function success1(parent) {
    //alert("Remove Recursively Succeeded---1");
	if(bUseSDCard == true) {
		fileSystem.root.getDirectory("file:///mnt/sdcard1/saleman/orders", {create: true}, function f(){}, fail);
	}else{
		fileSystem.root.getDirectory("saleman/orders", {create: true}, function f(){}, fail);
	}
}

function success2(parent) {
   //alert("Remove Recursively Succeeded---2");
	if(bUseSDCard == true) {
		fileSystem.root.getDirectory("file:///mnt/sdcard1/saleman/toserver", {create: true}, function f() {}, fail);
	}else{
		fileSystem.root.getDirectory("saleman/toserver", {create: true}, function f() {}, fail);
	}
}

function RecallOrder() {
	//alert("RecallOrder");
	$("#popupBasic").show();
	getDirectory();
}

function getDirectory() {
	if(bUseSDCard == true) {
		fileSystem.root.getDirectory("file:///mnt/sdcard1/saleman/toserver", {create: true}, getDirSuccess, fail);
	}else{
		fileSystem.root.getDirectory("saleman/toserver", {create: true}, getDirSuccess, fail);
	}
}

function getDirSuccess(dirEntry) {
	//alert("getDirSuccess");
	// Get a directory reader
    var directoryReader = dirEntry.createReader();

    // Get a list of all the entries in the directory
    directoryReader.readEntries(readerSuccess,fail);
}

function readerSuccess(entries) {
    var i;
    var st = "";
    g_FileList = [];
    for (i=0; i<entries.length; i++) {
        // Assuming everything in the Music directory is an mp3, go nuts
        // otherwise check entries[i].name to see if it ends with .mp3
    	var entry = entries[i];
    	if (entry.name.toLowerCase().indexOf("code") < 0)
    		continue;
    	
    	st += '<li>';
    	st += '<span class="entry">' + entry.name + '</span>';
    	st += '<input type="hidden" value="' + entry.name + '">';
    	st += '<span class="close" style="float:right;">X</span>';
    	st += '</li>';
    	g_FileList.push(entry.name);
    	//alert(entry.name);
    }
   // alert(g_FileList.length);
    //if(g_currentPage == SetupPage) {
    	$("#popupBasic #orderlist").html(st);
    	$("#popupBasic #orderlist").listview("refresh");
    //}
}

$('#popupBasic #orderlist li .entry').live('vclick', function(event){
	g_currentfileName = $(this).parent().find('input').val();
	//alert(g_currentfileName);
	$("#popupBasic").hide();
	openOrder(g_currentfileName);
});

$('#popupBasic #orderlist li .close').live('vclick', function(event){
	fileName = $(this).parent().find('input').val(); 
	//alert(g_currentfileName);
	if (confirm('Are you sure to delete this order file?')) {
		if(bUseSDCard == true) {
			fileSystem.root.getFile("file:///mnt/sdcard1/saleman/orders/" + fileName, {create: true}, getRemoveFileForOrders, fail);
			fileSystem.root.getFile("file:///mnt/sdcard1/saleman/toserver/" + fileName , {create: true}, getRemoveFileForServer, fail);	
		}else {
			fileSystem.root.getFile("saleman/orders/" + fileName, {create: true}, getRemoveFileForOrders, fail);
			fileSystem.root.getFile("saleman/toserver/" + fileName, {create: true}, getRemoveFileForServer, fail);	
		}
		$("#popupBasic").hide();
    }else {
    	return ;
    }
});

function getRemoveFileForOrders(fileEntry){
    console.log(fileEntry);
    fileEntry.remove(removesuccessForOrders, fail);
}

function getRemoveFileForServer(fileEntry){
    console.log(fileEntry);
    fileEntry.remove(removesuccessForServer, fail);
}

function removesuccessForOrders(entry) {
    console.log("removesuccessForOrders Removal succeeded");
}

function removesuccessForServer(entry) {
    console.log("removesuccessForServer Removal succeeded");
}


function closeRecall() {
	$("#popupBasic").hide();
}

function openOrder(fileName) {
	g_OrderFile = fileName;
	if(bUseSDCard == true) {
		orderfile = "file:///mnt/sdcard1/saleman/orders/" + g_OrderFile;
	}else{
		orderfile = "saleman/orders/" + g_OrderFile;
	}
    fileSystem.root.getFile(orderfile , null, gotOrderFileEntry, fail);
}

function gotOrderFileEntry(fileEntry) {
    fileEntry.file(gotOrderFile, fail);
}

function gotOrderFile(file){
    var reader = new FileReader();
    reader.onloadend = function(evt) {
    	var orderStr = evt.target.result; 
    	orderStr = orderStr.replace(/\n/g, 'x');
    	var orderList = orderStr.split("x");
    	g_orderList = [];
    	for(i=0;i<orderList.length-1;i++) {
    		var res = orderList[i].split(",");
    		var price = 0;
    		var model, description, remark;
    		var glass,base,lamps,ballast,region;
    		for(j=0;j<g_productList.length;j++) {
    			var product = g_productList[j];
    			if(res[3] == product.BARCODE) {
    				//alert(res[3]);
    				price = product.NETTPRICE; 
    				model = product.STOCK;
    				description = product.DESCRIPTION;
    				glass = product.GLASS;
    				base = product.BASE;
    				lamps = product.LAMPS;
    				ballast = product.BALLAST;
    				region = product.REGION;    				
    				remark = res[5];
    				break;
    			}
    		}
    		//model=stock=product name
    		g_orderList.push({
    			userid:res[0],
    			salemancode:res[1],
    			locationid:res[2], 
    			barcode: res[3],
    			price:price,
    			qty :res[4],
    			model:model,
    			description:description,
    			remark:remark,
    			glass:glass,
    			base:base,
    			lamps:lamps,
    			ballast:ballast,    			
    			region:region,
    			imageData: "" 			
    		});
    	}

        $.mobile.changePage($("#product_overview"));
        refreshProductReview();        
    };
    reader.readAsText(file);
}

$('#popupBasic').live('show', function(event){
	//alert("popup  basic");
});

$('#setup').live('pageshow', function(){
	g_currentfileName = "";	
	g_currentPage = SetupPage;
});


$('#btn-del').live('click', function() {
	return ;
	$.msgBox({
		title: "Are You Sure",
		content: "Would you like to remove existing data?",
		type: "confirm",
		buttons: [{ value: "Yes" }, { value: "No" }],
		success: function (result) {
			if (result == "Yes") {
				alert("Clicked Yes");
			}
		}
	});
});

function loginProcess(){
	g_UserId = $("#userid").val();
	g_SaleManCode = $("#salemancode").val();
	g_Location = $("#location").val();
	if(g_UserId.length<1) {
		$("#userid").focus();
		return;
	}
	if(g_SaleManCode.length<1) {
		$("#salemancode").focus();
		return;
	}
	if(g_Location.length<1) {
		$("#location").focus();
		return;
	}
	$.mobile.changePage($("#setup"));
}

$('#btn-barcode').live('click', function() {
	//alert("bar code scan");
	window.plugins.barcodeScanner.scan(scanSuccess, scanError);
	return;
	
	//This is test code
	g_Barcode = "1000000097399";
	for(i=0;i<g_productList.length;i++) {
		var product = g_productList[i];
		g_currentStockName = product.STOCK;
		if(g_Barcode == product.BARCODE) {
			localStorage.setItem("product", JSON.stringify(product));
			localStorage.setItem("productid", i);
			$.mobile.changePage($("#product"));
			filename = "file:///mnt/sdcard/stock/" + g_currentStockName + ".JPG";
			document.getElementById("product_img").src = filename;
			break;
		}
	}
});

$('#product #btn-ok').live('click', function() {
	id = localStorage.getItem("productid");
	var model = g_productList[id].STOCK;
	var barcode = g_productList[id].BARCODE;
	var glass = g_productList[id].GLASS;
	var base = g_productList[id].BASE;
	var lamps = g_productList[id].LAMPS;
	var ballast = g_productList[id].BALLAST;
	var region = g_productList[id].REGION;
	price = parseFloat($("#product #price").html());
	description = $("#product #description").val();
	qty = parseInt($("#product #qty").val());
	if(qty<0 || isNaN(qty) == true || qty>9999)  {
		$("#product #qty").focus();
		return ;
	}
	remark = $("#product #remark").val();
	if(g_bEdit == true && g_editNum != -1) {
		g_orderList[g_editNum].price = price;
		g_orderList[g_editNum].qty = qty;
		g_orderList[g_editNum].description = description;
		g_orderList[g_editNum].remark = remark;
	}else{
		var bflag = false;
		/*for(i=0;i<g_orderList.length;i++) {
			if(g_orderList[i].barcode == barcode) {
				bflag = true;
				g_orderList[i].qty = qty;
				g_orderList[i].remark = remark;
				break;
			}
		}*/
		if(bflag == false) {
			g_orderList.push({
				userid:g_UserId,
				salemancode:g_SaleManCode,
				locationid:g_Location, 
				barcode: barcode,
				price:price,
				qty :qty,
				model:model,
				description:description,
				remark:remark, 
				glass:glass,
    			base:base,
    			lamps:lamps,
    			ballast:ballast,    			
    			region:region,
				imageData: g_currentImageData
			});	
		}
		
	}
	$.mobile.changePage($("#product_overview"));
});

$('#product').live('pageshow', function(event){
	//$("#popupPhoto").popup("close");
	if(g_editNum == -1) {
		$("#product #remark").val("");
		$("#product #qty").val("");
	}
	
	/*id = localStorage.getItem("productid");
	var product = g_productList[id];
	$("#product #barcode").val(product.BARCODE);
	$("#product #model").html(product.STOCK);
	$("#product #price").val(product.NETTPRICE);
	//$("#product #qty").val(product.BARCODE);
	$("#product #description").val(product.DESCRIPTION);*/
});


function refreshProductReview() {
	var total = 0.0;
	var st = '<table cellspacing="0    class="product"> \
					<tr class="header"> \
					<th>Picture</td> \
					<th>Model</td> \
					<th>Price</td> \
					<th>QTY</td> \
					<th></td> \
				</th>';
	
	for(i=0;i<g_orderList.length;i++) {
		var product = g_orderList[i];
		total += product.price * product.qty;
		st += '<tbody>';
		st += '<tr class="top">';
		st += '<td class="pic">';
		//st += '<img width="80px" height="70px" src="' + product.imageData + '">';
		var imgurl = "file:///mnt/sdcard/stock/" + product.model + ".JPG";
		st += '<img width="80px" height="70px" src="' + imgurl + '">';
		//"file:///mnt/sdcard/offlineImages/MTZ FMJ61892PLCW EMPTY.JPG"; 
		st += '</td>';
		st += '<td class="model"><span>' + product.model + '</span></td>';
		st += '<td class="price">';
		st += '<span>$' + product.price + '</span>';
		st += '</td>';
		st += '<td class="qty" onclick="goDetail(' + product.barcode + ')"><span>' + product.qty + '</span></td>';
		st += '<td class="remove_btn" rowspan="3">';
		st += '<input type="button" onclick="removeOrder(' + i + ')" value="x">';
		st += '</td>';
		st += '</tr>';
		st += '<tr class="remark">';
		st += '<td colspan="4">' + product.remark + '</td>';
		st += '</tr>';
		st += '</tbody>';
	}
				
	st += '</table>';
	
	$("#product_overview #productlist").html(st);
	$("#product_overview #productlist").listview('refresh');
	$("#product_overview #total").val(total.toFixed(2));
}

function goDetail(barcode) {
	//alert(barcode);
	for(i=0;i<g_orderList.length;i++) {
		var product = g_orderList[i];
		if(barcode == product.barcode) {
			$("#product #barcode").html(product.barcode);
			$("#product #price").html(product.price);
			$("#product #model").html(product.model);
			$("#product #glass").html(product.glass);
			$("#product #base").html(product.base);
			$("#product #lamps").html(product.lamps);
			$("#product #ballast").html(product.ballast);
			$("#product #region").html(product.region);
			$("#product #qty").val(product.qty);
			$("#product #description").val(product.description);
			$("#product #remark").val(product.remark);
			
			filename = "file:///mnt/sdcard/stock/" + product.model + ".JPG";
			document.getElementById("product_img").src = filename;
			document.getElementById("popupimg").src = filename;
			
			g_bEdit = true;
			g_editNum = i;
			$.mobile.changePage($("#product"));
			break;
		}
	}
}

function showPicPopUp() {
	$("#popupPhoto").popup();
	$("#popupPhoto").popup("open");
}

function hidePicPopUp() {
	$("#popupPhoto").popup();
	$("#popupPhoto").popup("close");
}

$('#product_overview').live('pagebeforeshow', function(event){
	$("#product_overview #productlist").html('');
});

$('#product_overview').live('pageshow', function(event){
	var g_bEdit = false;
	g_editNum = -1;
	g_currentPage = OverviewPage;
	$("#product_overview #barcode").val("");
	$("#product_overview #barcode").focus();
	getDirectory();
	refreshProductReview();
	//alert(g_FileList.length);
});

function removeOrder(orderNum) {
	g_orderList.splice(orderNum, 1);
	refreshProductReview();
}

function onConfirm() {
	if(g_orderList.length < 1) {
		alert("No item!");
		return ;
	}
		
	
	if (confirm('Are you sure?')) {
        
    }else {
    	alert("no!");
    	return ;
    }
	
	var max = -1;
	var num = 1;
	for(i=0;i<g_FileList.length;i++) {
		a = g_FileList[i];
		b = g_FileList[i].indexOf(".");
		a = a.substring(4,b);
		a = parseInt(a);
		if(max <= a) 
			max = a;
	}
	num = max + 1;
	
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var min = today.getMinutes();
	var hr = today.getHours();
	var yyyy = today.getFullYear();

	if(dd<10)
		{dd='0'+dd} 
	if(mm<10)
		{mm='0'+mm} 
	today = dd+mm+yyyy+hr+min;
	
	var newFileName = "code" + today + ".txt";
	g_FileList.push(newFileName);
	
	
	
	if(bUseSDCard == true) {
		fileName1 = "file:///mnt/sdcard1/saleman/toserver/" + newFileName;
		fileName2 = "file:///mnt/sdcard1/saleman/orders/"  + newFileName;
	}else{
		fileName1 = "saleman/toserver/" + newFileName;
		fileName2 = "saleman/orders/" + newFileName;
	}

	fileSystem.root.getFile(fileName1, {create: true, exclusive: false}, gotFileEntryForServer, fail);
	fileSystem.root.getFile(fileName2, {create: true, exclusive: false}, gotFileEntryForLocal, fail);
}

function gotFileEntryForServer(fileEntry) {
    fileEntry.createWriter(gotFileWriterForServer, fail1);
}

function gotFileWriterForServer(writer) {
	var st = '';
	for(i=0;i<g_orderList.length;i++){
		/*alert("gotFileWriterForServer Step1");
		alert(g_orderList[i].locationid);
		writer.write(g_orderList[i].userid);
		alert("TTTT11");
		writer.seek(writer.length);
		alert("TTTT22");
		writer.write(",");
		
		alert(g_orderList[i].salemancode + "gotFileWriterForServer Step2");
		writer.seek(writer.length);
		writer.write(g_orderList[i].salemancode);
		writer.write(",");
		
		alert(g_orderList[i].locationid);
		
		alert(g_orderList[i].locationid + "gotFileWriterForServer Step3");
		writer.seek(writer.length);
		writer.write(g_orderList[i].locationid);
		writer.write(",");
		
		
		alert(g_orderList[i].barcode + "gotFileWriterForServer Step4");
		writer.write(g_orderList[i].barcode + ",");
		alert(g_orderList[i].qty+"gotFileWriterForServer Step5");
		writer.write(g_orderList[i].qty);
		alert("gotFileWriterForServer Step6");
		writer.write("\n");
		alert("gotFileWriterForServer Step7");
		writer.abort();*/
		st += g_orderList[i].userid + ",";
		st += g_orderList[i].salemancode + ",";
		st += g_orderList[i].locationid + ",";
		st += g_orderList[i].barcode + ",";
		st += g_orderList[i].qty;
		st += "\r";
		st += "\n";
	}
	writer.seek(writer.length);
	writer.write(st);

	//alert("gotFileWriterForServer Success!");
	
}

function gotFileEntryForLocal(fileEntry) {
    fileEntry.createWriter(gotFileWriterForLocal, fail2);
}

function gotFileWriterForLocal(writer) {
	 /*writer.onwriteend = function(evt) {
	        console.log("contents of file now 'some sample text'");
	        writer.truncate(11);  
	        writer.onwriteend = function(evt) {
	            console.log("contents of file now 'some sample'");
	            writer.seek(4);
	            writer.write(" different text");
	            writer.onwriteend = function(evt){
	                console.log("contents of file now 'some different text'");
	            }
	        };
	    };
	    writer.write("some sample text");

	return;*/
	var st = '';
	for(i=0;i<g_orderList.length;i++){
		st += g_orderList[i].userid + ",";
		st += g_orderList[i].salemancode + ",";
		st += g_orderList[i].locationid + ",";
		st += g_orderList[i].barcode + ",";
		st += g_orderList[i].qty + ",";
		st += g_orderList[i].remark;
		st += "\r";
		st += "\n";
		/*writer.write(g_orderList[i].userid + ",");
		writer.write(g_orderList[i].salemancode + ",");
		writer.write(g_orderList[i].locationid + ",");
		writer.write(g_orderList[i].barcode + ",");
		writer.write(g_orderList[i].qty + ",");
		writer.write(g_orderList[i].remark);
		writer.write("\n");
		writer.seek(writer.length);*/
	}

	writer.write(st);
	//alert("gotFileWriterForLocal Success!");
	g_orderList = [];
	$.mobile.changePage($("#setup"));	
}


function fail1(error) {
    console.log(error.code);
}

function fail2(error) {
    console.log(error.code);
}

var scanSuccess = function(result) {
	alert("We got a barcode\n" +
			 "Result: " + result.text + "\n" +
			 "Format: " + result.format + "\n" +
			 "Cancelled: " + result.cancelled);
		
	//alert("scanSuccess: " + result.text + ". Format: " + result.format + ". Cancelled: " + result.cancelled);
	if (!result.cancelled) {
		var scancode = result.text;
		//alert(scancode);
		
		//This is test code
		//g_Barcode = "1000000097399";
		g_Barcode = scancode;
		for(i=0;i<g_productList.length;i++) {
			var product = g_productList[i];
			g_currentStockName = product.STOCK;
			if(g_Barcode == product.BARCODE) {
				$("#product #barcode").val(product.BARCODE);
				$("#product #price").val(product.NETTPRICE);
				$("#product #model").html(product.STOCK);
				$("#product #description").val(product.DESCRIPTION);
				
				filename = "file:///mnt/sdcard/stock/" + g_currentStockName + ".JPG";
				document.getElementById("product_img").src = filename;
				
				localStorage.setItem("product", JSON.stringify(product));
				localStorage.setItem("productid", i);
				$.mobile.changePage($("#product"));
			}
		}		
		
	} else {
		console.log("scan cancelled.");
		//$('#scanstatus').addClass('errortxt').removeClass('successtxt').html("Cancelled");
	}        
};

var scanError = function(error) {
	//alert("Scan failed: " + error);
};


function onClearAll(){
	g_orderList = [];
	$("#product_overview #productlist").html('');
	$("#product_overview #productlist").listview('refresh');
	$("#product_overview #total").val('0');
}
function onBackFromResult(){
	$.mobile.changePage($("#setup"));
}

$('#result').live('pagebeforeshow', function(){
	$("#result #result_list").html('');	
});

$('#result').live('pageshow', function(){
	var st = '';
	for(i=0;i<g_result.length;i++) {
		st += '<li>';
		st += '<input class="barcode" type="hidden" value="' + g_result[i].barcode + '">';;
		st += '<div class="name">' + g_result[i].stock.toUpperCase() + '</div>';
		st += '<div class="desc">' + g_result[i].description + '</div>';
		st += '</li>';
	}
	$("#result #result_list").html(st);	
});


$('#result #result_list li ').live('vclick', function(event){
	var scancode = $(this).find('.barcode').val();
	//alert(scancode);
	g_Barcode = scancode;
	var bflag = false;
	for(i=0;i<g_productList.length;i++) {
		var product = g_productList[i];
		g_currentStockName = product.STOCK;
		if(g_Barcode == product.BARCODE) {
			bflag = true;
			$("#product #barcode").html(product.BARCODE);
			$("#product #price").html(product.NETTPRICE);
			$("#product #model").html(product.STOCK);
			$("#product #glass").html(product.GLASS);
			$("#product #base").html(product.BASE);
			$("#product #lamps").html(product.LAMPS);
			$("#product #ballast").html(product.BALLAST);
			$("#product #region").html(product.REGION);
			$("#product #description").val(product.DESCRIPTION);
			
			filename = "file:///mnt/sdcard/stock/" + g_currentStockName + ".JPG";
			document.getElementById("product_img").src = filename;
			document.getElementById("popupimg").src = filename;			
			
			localStorage.setItem("product", JSON.stringify(product));
			localStorage.setItem("productid", i);
			$.mobile.changePage($("#product"));
		}
	}
});