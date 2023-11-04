// BEGIN SCRIPT DESCRIPTION BLOCK  ==================================
{
    /*
        DEV code for customer 
           Script Name: UES_append_logo_and_prefix_customer.js
        Author:		 Rakesh K 
        Company:     YDG 
        Date:		 07/28/2017
        Description: This script is uses for putting logo at customer record and also creating field at purchase order for shipping method 
    
    
        Script Modification Log:
    
        -- Date --			-- Modified By --				--Requested By--				-- Description --
    
    
    
    Below is a summary of the process controls enforced by this script file.  The control logic is described
    more fully, below, in the appropriate function headers and code blocks.
    
    
         BEFORE LOAD
            - beforeLoadRecord(type)
    
    
    
         BEFORE SUBMIT
            - beforeSubmitRecord(type)
    
    
         AFTER SUBMIT
            - afterSubmitRecord(type)
    
    
    
         SUB-FUNCTIONS
            - The following sub-functions are called by the above core functions in order to maintain code
                modularization:
    
                   - NOT USED
    
    */
}
// END SCRIPT DESCRIPTION BLOCK  ====================================



// BEGIN GLOBAL VARIABLE BLOCK  =====================================
{
    //  Initialize any Global Variables, in particular, debugging variables...




}
// END GLOBAL VARIABLE BLOCK  =======================================

function taxupdateForPhoneRefunds(){
var rectype = nlapiGetRecordType();	
//Tax calucaltion for Refund page
	if(rectype == 'cashrefund'){
		var returnAuthId = nlapiGetFieldValue('createdfrom');
		if(returnAuthId!="" && returnAuthId != null){
		//	nlapiLogExecution('AUDIT', 'Naga Refund Page returnAuthId', returnAuthId); // Dinesh
			var return_auth_tax = nlapiLookupField('returnauthorization',returnAuthId,'taxtotal');
		//	nlapiLogExecution('AUDIT', 'Naga Refund Page return_auth_tax', return_auth_tax); // Dinesh
			if(return_auth_tax != null){
				return_auth_tax = return_auth_tax.replace("-","");
				if(return_auth_tax != '' && return_auth_tax != 'undefined'){
				//	nlapiLogExecution('AUDIT', 'Naga Refund Page return_auth_tax', return_auth_tax);  // Dinesh
					nlapiSetFieldValue('taxamountoverride', return_auth_tax);
					return true;
				}
			}
		}
	}
}

//Shipping Split code
function shippingChargesSplitAfterPageLoad(){ 
    var rectype = nlapiGetRecordType();	
	var recid = nlapiGetRecordId() > 0 ? nlapiGetRecordId() : '0';		
	var line_shipping_cost = 0;
	var final_line_shipping_cost = 0; 
	if(rectype == 'cashsale' || rectype == 'invoice'  || rectype == 'itemfulfillment'){
		try
		{
			var itemsCount = nlapiGetLineItemCount('item');	
			if(itemsCount>0){
				for(i=1;i<=itemsCount;i++){
					currrent_item_qty = nlapiGetLineItemValue('item','quantity',i);
					line_shipping_cost = nlapiGetLineItemValue('item','custcol_ilt_shipping_cost',i)?parseFloat(nlapiGetLineItemValue('item','custcol_ilt_shipping_cost',i)):0;
					 final_line_shipping_cost += parseFloat(line_shipping_cost);
					nlapiLogExecution('AUDIT','final_line_shipping_cost Line',final_line_shipping_cost)													
				}
				//if(final_line_shipping_cost>0 || final_line_shipping_cost == 0){
					nlapiSetFieldValue('shippingcost',final_line_shipping_cost);
					nlapiLogExecution('AUDIT','Inside update ship',final_line_shipping_cost)
				//}
			}
		}catch(e)
		{
			nlapiLogExecution('error','Promo error',e.message);
		}
	}
}

// BEGIN BEFORE LOAD ==================================================

function beforeLoadRecord_add_field(type, form) {
	marketPlaceFun();
  var rectype = nlapiGetRecordType();  
  //taxAmountUpdateFromWebsiteColumn();
  
  //Naga commented this for INTNS-3312
  taxupdateForPhoneRefunds();
  //Remove SO Total amount for non canada orders - Naga added this for INTNS-2554
	var Ship_country = nlapiGetFieldValue('shipcountry');
	var Ship_country_so = nlapiGetFieldText('custbody102');
	var AVA_Canada_Live_Status = nlapiGetFieldValue('custbody_canada_live');
	if(!((Ship_country == "CA" || Ship_country_so == 'Canada') && AVA_Canada_Live_Status == 'T') && rectype == 'salesorder' && type == 'copy')
	{
		nlapiLogExecution('debug', 'Naga', 'This is non canada Order');
		nlapiSetFieldValue('custbody_canada_subtotal', '')
		nlapiSetFieldValue('custbody_gst', '')
		nlapiSetFieldValue('custbody_hst', '')
		nlapiSetFieldValue('custbody_pst', '')
		nlapiSetFieldValue('custbody_qst', '')
		nlapiSetFieldValue('custbody_duties', '')
		nlapiSetFieldValue('custbody_total_so_amount', '')
	}
	//end 
	
	//Naga did changes for INTNS-3322
	var customFormID = nlapiGetFieldValue('customform');
	if(customFormID == 167){
		nlapiSetFieldValue('shippingcost','0');
		nlapiSetFieldValue('handlingcost','0');
	}
  //Commented for OR-98
  /* var custbody_promo_spilt = nlapiGetFieldValue('custbody_promo_spilt');
  if(custbody_promo_spilt == 'T'){
	promotionsOnCashsaleLoad(type);
  } */
  	//Dinesh
var context = nlapiGetContext(); // Dinesh
var excutution_context = context.getExecutionContext(); // Dinesh
  var recID = nlapiGetRecordId();
  var rectype = nlapiGetRecordType();	
  var source = nlapiGetFieldText('custbody_lum_rga_created_by')?nlapiGetFieldText('custbody_lum_rga_created_by'):'';
//	  nlapiLogExecution('debug', 'RO1 source='+source, source); // Dinesh
	//Commented for OR-98
	/* if(rectype == 'returnauthorization'){
		promotionsOnReturnPageLoadJson();
	} */

  if(rectype != 'cashsale' && rectype != 'cashrefund'){

  var custforms = ["304","305","306","307"]
  var custForm = nlapiGetFieldValue('customform')
  if(custforms.indexOf(custForm) != -1){
	if(type == 'create' || type == 'copy'){
		nlapiSetFieldValue('class',4)
	   //Intns-2136 set Price Factor to 1.45 on create
	   var priceFactor = nlapiGetFieldValue('custbody_price_factor')
	   var excludeS_H = nlapiGetFieldValue('custbody_exclude_s_h')  // Dinesh added code for INTNS-2556 
	//   nlapiLogExecution('audit','excludeS_H',excludeS_H) // Dinesh added code for INTNS-2556 // Dinesh
	   if(!priceFactor || priceFactor == null || priceFactor == '' || priceFactor == 'undefined' || type == 'copy')
		  	//  nlapiSetFieldValue('custbody_price_factor',1.45) //  Closed this line
	        nlapiSetFieldValue('custbody_price_factor',1.4) // Dinesh added 1.4 price Factor instead of 1.45 for INTNS-2556
	}
	}
    
    if (rectype == 'estimate' || rectype == 'salesorder') {
        try {

            var busU = nlapiGetFieldValue('custbody_cseg_ilt_busns_unit');
            if (busU == null) {
                var cust = nlapiGetFieldValue('entity')
                if (cust) {
                    var bu = nlapiLookupField('customer', cust, 'custentity_cseg_ilt_busns_unit')
             //       nlapiLogExecution('debug', 'Customer Business Unit', bu);

                    if (bu) {
                        nlapiSetFieldValue('custbody_cseg_ilt_busns_unit', 2, true, true);
                        busU = nlapiGetFieldValue('custbody_cseg_ilt_busns_unit');
                        if (busU == null)
                            nlapiSetFieldValue('entity', cust)
                        busU = nlapiGetFieldValue('custbody_cseg_ilt_busns_unit');
                     //   nlapiLogExecution('debug', 'Before Load set Business Unit', busU);

                    }
                }
				
				
				 if (busU) {
                    if (busU == '2') {
                        nlapiSetFieldValue('creditcardprocessor', 1)
                        nlapiSetFieldValue('custbody_cseg_ilt_brand', 1)
                    //    nlapiLogExecution('debug', 'Before Load creditcardprocessor and Brand set to', 'Lumens');
                    } else {
                        nlapiSetFieldValue('creditcardprocessor', 2)
                        //  nlapiSetFieldValue('custbody_cseg_ilt_brand',2)
                     //   nlapiLogExecution('debug', 'Before Load creditcardprocessor', 'YLighting & YLiving');
                    }

                } else{
                    //nlapiLogExecution('debug', 'Business Unit is null', busU);
				}
				
					// Added by Dinesh for New payment_processer code --started-- Part -I 
				if((type == 'create' || type == 'copy') && excutution_context == 'userinterface'){
					//nlapiLogExecution('debug', 'Business Unit is null - type == create && excutution_context == userinterface -if', type);
                if (busU) {
                    if (busU == '2') {
                        nlapiSetFieldValue('creditcardprocessor', 5)
                        nlapiSetFieldValue('custbody_cseg_ilt_brand', 1)
                    //    nlapiLogExecution('debug', 'Before Load creditcardprocessor and Brand set to', 'Lumens');
                    } else {
                        nlapiSetFieldValue('creditcardprocessor', 6)
                        //  nlapiSetFieldValue('custbody_cseg_ilt_brand',2)
                     //   nlapiLogExecution('debug', 'Before Load creditcardprocessor', 'YLighting & YLiving');
                    }

                } else{
                    nlapiLogExecution('debug', 'Business Unit is null - type == create && excutution_context == userinterface -else', type);
				}
			}
			// Added by Dinesh for New payment_processer code --Ended-- Part -I 
				
			}
			else if (busU == '2') 
			{
				nlapiSetFieldValue('creditcardprocessor', 1)
				nlapiSetFieldValue('custbody_cseg_ilt_brand', 1)
				//nlapiLogExecution('debug', 'Before Load creditcardprocessor and Brand set to', 'Lumens');
			} 
			else 
			{
				nlapiSetFieldValue('creditcardprocessor', 3)
				//  nlapiSetFieldValue('custbody_cseg_ilt_brand',2)
			//	nlapiLogExecution('debug', 'Before Load creditcardprocessor', 'YLighting & YLiving'); // Dinesh
			}
			// Added by Dinesh for New payment_processer code --started-- Part -II
			if((type == 'create' || type == 'copy') && excutution_context == 'userinterface'){
				 //nlapiLogExecution('debug', 'Business Unit is null - type == create && excutution_context == userinterface -normal -1', type);
                if (busU) {
                    if (busU == '2') {
                        nlapiSetFieldValue('creditcardprocessor', 5)
                        nlapiSetFieldValue('custbody_cseg_ilt_brand', 1)
                    //    nlapiLogExecution('debug', 'Before Load creditcardprocessor and Brand set to', 'Lumens');
                    } else {
                        nlapiSetFieldValue('creditcardprocessor', 6)
                        //  nlapiSetFieldValue('custbody_cseg_ilt_brand',2)
                     //   nlapiLogExecution('debug', 'Before Load creditcardprocessor', 'YLighting & YLiving');
                    }

                } else{
                    //nlapiLogExecution('debug', 'Business Unit is null - type == create && excutution_context == userinterface-normal -2', type);
				}
			}
			// Added by Dinesh for New payment_processer code --Ended-- Part -II
			
        } catch (e) {
            nlapiLogExecution('error', 'error', e);
        }
    }

    if (rectype == 'customer' || rectype == 'prospect') {
        var business_unit = nlapiGetFieldValue('custentity_cseg_ilt_busns_unit');
        //nlapiLogExecution('debug', 'business_unit', business_unit);
        if (business_unit == 2) { // lumens 

            var strVar = "";
            strVar += "<html>";
            strVar += "<body>";
            strVar += "";
            strVar += "<img src=\"https:\/\/647267.app.netsuite.com\/core\/media\/media.nl?id=22474026&c=647267&h=ee515917b7b65fb545f4\"> ";
            //    strVar += "<img src=\"https:\/\/system.netsuite.com\/core\/media\/media.nl?id=22474026&c=647267_SB2&h=4d4634972bc7b2fa8ade&whence=\" alt=\"Lumens Logo\" >";
            strVar += "";
            strVar += "<\/body>";
            strVar += "<\/html>";
            //

        } else if (business_unit == 1) { // Y brand 

            var strVar = "";
            strVar += "<html>";
            strVar += "<body>";
            strVar += "";
            strVar += "<img src=\"https:\/\/647267.app.netsuite.com\/core\/media\/media.nl?id=22474025&c=647267&h=972e8bd71faaf8c95805\">";
            // strVar += "<img src=\"https:\/\/system.netsuite.com\/core\/media\/media.nl?id=22474025&c=647267_SB2&h=6737c6a07ce26a35d8f9&whence=\" alt=\"Y Group Logo\" >";
            strVar += "";
            strVar += "<\/body>";
            strVar += "<\/html>";

        }
       nlapiSetFieldValue('custentity_ilt_ydg_logo', strVar);
    }
    //nlapiLogExecution('debug', 'rectype', rectype);
 /*   if (rectype == 'customer') {  // Dinesh closed this if condition for INTNS- 2620 ALT. CUSTOMER ID -- started

        var context = nlapiGetContext();
        //nlapiLogExecution("debug","context",context);
        var excutution_context = context.getExecutionContext();
        //nlapiLogExecution("debug","excutution_context",excutution_context);
        if (excutution_context != 'scheduled') {

            if (type == 'edit' || type == 'view') {

                var customerID = nlapiGetRecordId();
                //var customerType = nlapiGetRecordType();
                //var obj_cust = nlapiLoadRecord(customerType, customerID);

                //nlapiLogExecution("debug","obj_cust",obj_cust);
                var filter = new Array();
                var cloumns = new Array();
                var business_unit = nlapiGetFieldValue('custentity_cseg_ilt_busns_unit');
                //nlapiLogExecution("debug","business_unit",business_unit);
                var s_email = nlapiGetFieldValue('email');
                //nlapiLogExecution("debug","s_email",s_email);
                if (!s_email) return;
                if (business_unit) {

                    if (business_unit == 1) { // lumnes 

                        filter[0] = new nlobjSearchFilter('custentity_cseg_ilt_busns_unit', null, 'anyof', 2);
                        //if(s_email != null || s_email != '')
                        {
                            filter[1] = new nlobjSearchFilter('email', null, 'is', s_email);
                        }



                    } else if (business_unit == 2) { // Y group 

                        filter[0] = new nlobjSearchFilter('custentity_cseg_ilt_busns_unit', null, 'anyOf', 1);
                        //if(s_email != null || s_email != '')
                        {
                            filter[1] = new nlobjSearchFilter('email', null, 'is', s_email);
                        }
                    }
                    filter[2] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
                    cloumns[0] = new nlobjSearchColumn('internalid');
                    var search = nlapiSearchRecord('customer', null, filter, cloumns);
                    //nlapiLogExecution("debug","search",search.length);

                    if (search) {

                        var resultset = search[0];
                        //nlapiLogExecution("debug","resultset",resultset.length);
                        var internalID = resultset.getValue(cloumns[0]);
                        nlapiLogExecution("debug", "internalID", internalID);
                        if (internalID) {

                            var alt_customer = nlapiGetFieldValue('custentityilt_customer_yl');

                            if (alt_customer == '' || alt_customer == null) {
                                nlapiSubmitField('customer', customerID, 'custentityilt_customer_yl', internalID);
                            }

                            //obj_cust.setFieldValue('custentityilt_customer_yl',internalID);
                            //var cust_ID = nlapiSubmitRecord(obj_cust,true,true);
                        }


                    }
                } else
                    nlapiLogExecution("debug", "Business is null on customer", customerID);
            }
        }


        return true;

    } */ // Dinesh closed this if condition for INTNS- 2620 ALT. CUSTOMER ID -- endded
  }
}

// END BEFORE LOAD ====================================================


// BEGIN BEFORE SUBMIT ================================================
function beforeSubmitRecord_duplicate_check(type) {
	nlapiLogExecution('audit', 'type', type)
  var rectype = nlapiGetRecordType();
  
  //Naga did changes for INTNS-3322
	var customFormID = nlapiGetFieldValue('customform');
	if(customFormID == 167){
		nlapiSetFieldValue('shippingcost','0');
		nlapiSetFieldValue('handlingcost','0');
	}
	
	//Naga added code changes for INTNS-2910 
	if (rectype == 'purchaseorder' || rectype == 'salesorder'){
		var so_line_count=nlapiGetLineItemCount('item');
		for(var i=1;i<=so_line_count;i++)
		{
			try{
				var description = nlapiGetLineItemValue('item','description',i);
				if(description!="" && description!=null){
					nlapiSelectLineItem('item', i);	
					description = description.replace(/\|/g,"");				
					description = description.replace(/\u0005/g, ",");				 
					nlapiSetCurrentLineItemValue('item','description',description);  
					nlapiCommitLineItem('item'); 
				}
	    		
				//Naga added INTNS-2722
				
				var item_type = nlapiGetLineItemValue('item','itemtype',i)
				var created_from = nlapiGetFieldValue('createdfrom')
				nlapiLogExecution('debug','customer esd',created_from);		
				if((rectype == 'salesorder' && created_from != '' && type == 'edit') && (item_type == 'Group' || item_type == 'EndGroup' || item_type == 'InvtPart')){
					var statement = nlapiGetLineItemValue('item', 'custcol_lum_promise_date',i);
					var date = new Date();
				    var date1 = nlapiDateToString(date);
					if(statement!=null && statement!=""){
						var shipStatement = statement.substr(0,12)
						if(shipStatement == "Please call" ||statement == '' || shipStatement == 'Out of Stock'){
							nlapiSelectLineItem('item', i);	
							nlapiSetCurrentLineItemValue('item','custcol_lum_promised_esd','');
							nlapiSetCurrentLineItemValue('item','custcol_ship_date','');
							nlapiSetCurrentLineItemValue('item','custcol_esd1','');
							nlapiCommitLineItem('item'); 
						}
					}
				}
			//INTNS-2722 code done
			
			//INTNS-3322
			nlapiLogExecution("debug", "customFormID:type:item_type", customFormID+"=="+type+"=="+item_type);
			if(customFormID == 167 && (type == 'edit' || type == 'create') && item_type == 'InvtPart'){
				nlapiSelectLineItem('item', i);
				nlapiSetCurrentLineItemValue('item','custcol_ilt_shipping_cost',0);
				nlapiSetCurrentLineItemValue('item','custcol_handling_cost',0);
				nlapiCommitLineItem('item'); 
			}
			nlapiLogExecution('Audit','record type',rectype);
			nlapiLogExecution('Audit','type of',type);
			nlapiLogExecution('Audit','item type',item_type);
			
			//INTNS - 3381 SWAPNA code changes start
		/* if(((rectype == 'salesorder' || rectype == 'estimate') && (type == 'edit' ||type == 'create' || type == 'copy' ))&& (item_type == 'Group' || item_type == 'EndGroup' || item_type == 'InvtPart')){
			var item_id = nlapiGetLineItemValue('item', 'item',i)
			var quantity = nlapiGetLineItemValue('item', 'quantity',i)
			
			//var handlingcost = nlapiLookupField('item', item_id,'handlingcost')

			nlapiSelectLineItem('item', i)
			var handlingcost = nlapiCurrentLineItemValue('item', 'custcol_handling_cost')

			if(handlingcost !=null && handlingcost != ''){
				//nlapiSetCurrentLineItemValue('item','custcol_handling_cost',handlingcost)
				nlapiSetCurrentLineItemValue('item','custcol_total_handling_cost',handlingcost*quantity)
				nlapiLogExecution('Audit','handling cost value',handlingcost);

			}else{
				nlapiSetCurrentLineItemValue('item','custcol_handling_cost',0.00)
				nlapiSetCurrentLineItemValue('item','custcol_total_handling_cost',0.00)
			}
			nlapiCommitLineItem('item')
		} */
			//END 3381
			
			
	 
			}catch(e){
				nlapiLogExecution('ERROR','Error Occured whicl setting Each with price factor',e)
			}
			
		}			
	}
	//Done INTNS-2910
	 
	
  marketPlaceFun();
  taxAmountUpdateFromWebsiteColumn(type);
  
  //Naga commented this for INTNS-3312
  //taxupdateForPhoneRefunds();
  
  //Naga added this for INTNS-3043
	if(rectype == 'customer' || rectype == 'prospect'){
		updateTaxExemptStatus();
	}
	
	//Naga added this for INTNS-3113
/* 	if(type == 'create' && rectype == 'returnauthorization'){
		updateCallTagValue();
	}  */
  
  if(rectype == 'cashsale' || rectype == 'invoice'){	
		shippingChargesSplitAfterPageLoad();	
	}
	
  if(type == 'create'){
	  //Remove SO Total amount for non canada orders - Naga added this for INTNS-2554
	var Ship_country = nlapiGetFieldValue('shipcountry');
	var Ship_country_so = nlapiGetFieldText('custbody102');
	var AVA_Canada_Live_Status = nlapiGetFieldValue('custbody_canada_live');
	var rectype = nlapiGetRecordType(); 
	if(!((Ship_country == "CA" || Ship_country_so == 'Canada') && AVA_Canada_Live_Status == 'T') && rectype == 'salesorder')
	{
		nlapiLogExecution('debug', 'Naga', 'This is non canada Order');
		nlapiSetFieldValue('custbody_canada_subtotal', '')
		nlapiSetFieldValue('custbody_gst', '')
		nlapiSetFieldValue('custbody_hst', '')
		nlapiSetFieldValue('custbody_pst', '')
		nlapiSetFieldValue('custbody_qst', '')
		nlapiSetFieldValue('custbody_duties', '')
		nlapiSetFieldValue('custbody_total_so_amount', '')
		//nlapiSendEmail("18956886","nagarjuna.enumula@ydesigngroup.com","Before Submit - "+rectype+"("+Ship_country+"---"+Ship_country_so+"---"+AVA_Canada_Live_Status")",Ship_country_so,"nagarjuna.enumula@ydesigngroup.com","nagarjuna.enumula@ydesigngroup.com",null,null);
		
	}
	//end
	  promotionsOnPageLoad(type);
  }  
  
  if(rectype != 'cashsale' && rectype != 'cashrefund' && customFormID != 167){

    var context = nlapiGetContext();


  //  nlapiLogExecution('debug', 'beforesubmit type and context', type + ' and ' + context.getExecutionContext());
    try {
        var rectype = nlapiGetRecordType();
       

        if (type == 'approve') {
            var datenow = new Date();
            var approveDate = nlapiDateToString(datenow, 'datetimetz')
      //      nlapiLogExecution('debug', 'approveDate', approveDate) // Dinesh
            nlapiSetFieldValue('custbody_approval_date', approveDate)
        }


   /*     if (type == 'create' && (rectype == 'customer' || rectype == 'prospect')) {  // Dinesh closed this if condition for INTNS- 2620 ALT. CUSTOMER ID -- started
            nlapiLogExecution('audit', 'salesrep BS before', nlapiGetNewRecord().getFieldValue('salesrep') + ':' + nlapiGetNewRecord().getFieldValue('salesrep'));

            var email = nlapiGetFieldValue('email');
            var i_brand = nlapiGetFieldValue('custentity_cseg_ilt_busns_unit');
            if (email == null || email == '' || i_brand == null) return;

            var i_brand_text = nlapiGetFieldText('custentity_cseg_ilt_busns_unit');
            var filter = new Array();
            nlapiLogExecution('debug', 'duplicate checking', JSON.stringify({
                i_brand: i_brand,
                email: email
            }))
            if (rectype == 'customer') {

                if (i_brand && email) {
                    filter[0] = new nlobjSearchFilter('custentity_cseg_ilt_busns_unit', null, 'anyof', i_brand);
                    filter[1] = new nlobjSearchFilter('email', null, 'is', email);

                    var search = nlapiSearchRecord('customer', null, filter);
                    if (search) {
                        //A record is with this email kzone@gmail.com and Business Unit Y Brands already exists. Please verify
                        throw '  A record is with this email ' + email + ' and Business Unit ' + i_brand_text + ' already exists. Please verify: ' + search[0].getId();
                    }
                }
            }

            nlapiLogExecution('audit', 'salesrep BS after', nlapiGetNewRecord().getFieldValue('salesrep') + ':' + nlapiGetNewRecord().getFieldValue('salesrep'));

        }  */ // Dinesh closed this if condition for INTNS- 2620 ALT. CUSTOMER ID -- Closed


        if (rectype == 'estimate' || rectype == 'salesorder') {
            try {
				
				var excutution_context = context.getExecutionContext();
				//Added By Yogesh To Set Invoca Id from Customer Record to estimate/Sales Order INTNS-1676
				//nlapiLogExecution('debug', 'context ', context)
				if (type == 'create' && excutution_context == 'userinterface')
				{
					var cust_id=nlapiGetFieldValue('entity');
				//	nlapiLogExecution('debug', 'Customer ID', cust_id) // Dinesh
					
					if(cust_id)
					{
						var cust_invoca_id=nlapiLookupField('customer',cust_id,'custentity_invoca_id');
					//	nlapiLogExecution('debug', 'Customer Invoca ID', cust_invoca_id) // Dinesh
						
						if(cust_invoca_id)
						{
							nlapiSetFieldValue('custbody_invoca_id',cust_invoca_id)					
						}
						
						// Dinesh for Application Source -- Start --
						
						var cust_Application_source=nlapiLookupField('customer',cust_id,'custentity_ilt_application_source');
					//	nlapiLogExecution('debug', 'APPLICATION SOURCE', cust_Application_source) // Dinesh
						
						if(cust_Application_source)
						{
							nlapiSetFieldValue('custbody_ilt_application_source',cust_Application_source)					
						}
						
						// Dinesh for Application Source -- Endded --
						
						
					}
					
					
					
				}
				
                var busU = nlapiGetFieldValue('custbody_cseg_ilt_busns_unit');
                if (busU == null) {
                    var cust = nlapiGetFieldValue('entity')
                    if (cust) {
                        var bu = nlapiLookupField('customer', cust, 'custentity_cseg_ilt_busns_unit')
                 //       nlapiLogExecution('debug', 'Customer Business Unit', bu); // Dinesh

                        if (bu) {
                            nlapiSetFieldValue('custbody_cseg_ilt_busns_unit', 2, true, true);
                            busU = nlapiGetFieldValue('custbody_cseg_ilt_busns_unit');
                            if (busU == null) {
                                nlapiSetFieldValue('entity', cust)
                                busU = nlapiGetFieldValue('custbody_cseg_ilt_busns_unit');
                            }
                      //      nlapiLogExecution('debug', 'Before Submit set Business Unit', busU); // Dinesh

                        }
                    }
                }
                if (busU) {

                    var context = nlapiGetContext();
                    //  nlapiLogExecution("debug", "context", context);
                    var excutution_context = context.getExecutionContext();

                    if (excutution_context == 'userinterface') {
					// Added by Dinesh for New payment_processer code --started-- Part -III								
					var setting_fixed_date =  new Date("7/22/2021")
					var fixed_date = nlapiDateToString(setting_fixed_date)
					//nlapiLogExecution('Audit', 'fixed_date', fixed_date); 
					var record_create_date =  nlapiGetFieldValue('trandate');
					//nlapiLogExecution('Audit', 'record_create_date', record_create_date); 
					
					if (record_create_date >= fixed_date){

					if (type == 'create' && excutution_context == 'userinterface') {
						nlapiLogExecution('Audit', 'Just I am in first If condition', 'Just I am in first If condition');

                        if (busU == '2') {
                            nlapiSetFieldValue('creditcardprocessor', 5)
                            nlapiSetFieldValue('custbody_cseg_ilt_brand', 1)
                         //   nlapiLogExecution('debug', 'Before Submit creditcardprocessor and Brand set to', 'Lumens');
                        } else {
                            nlapiSetFieldValue('creditcardprocessor', 6)
                            // nlapiSetFieldValue('custbody_cseg_ilt_brand',2)
                          //  nlapiLogExecution('debug', 'Before Submit creditcardprocessor', 'YLighting & YLiving');
                        }
						
					nlapiLogExecution('AUDIT', 'new Date Condition', 'new Date Condition');
					}
					}					
					else{
						if (type == 'create' && excutution_context == 'userinterface') {							

						  if (busU == '2') {
                            nlapiSetFieldValue('creditcardprocessor', 5)
                            nlapiSetFieldValue('custbody_cseg_ilt_brand', 1)
                         //   nlapiLogExecution('debug', 'Before Submit creditcardprocessor and Brand set to', 'Lumens_New');
                        } else {
                            nlapiSetFieldValue('creditcardprocessor', 6)
                            // nlapiSetFieldValue('custbody_cseg_ilt_brand',2)
                          //  nlapiLogExecution('debug', 'Before Submit creditcardprocessor', 'YLighting_new');
                        }
						}
					}
                         // Added by Dinesh for New payment_processer code --Endded-- Part -III					

                        //Calculating the Items cost to find whether they are eligible for Free shipping if <75


                        var b = nlapiGetFieldValue('custbody_cseg_ilt_brand');
                        if (b) { 

                            var count = nlapiGetLineItemCount('item');
                      //      nlapiLogExecution('debug', 'count', count); // Dinesh
                            var l_count = 0;
                            var f_count = 0;
							var no_expedit_count = 0; // Added by Dinesh for INTNS-3258
                            var upsShipCount = 0
                            var new_shippingcost = 0;
                            var free_75_cost = 0.00;
							var market_tax = 0;
							//Naga did changes for INTNS-3305
							var handlingcost = 0.00;
							var final_handling_cost = 0.00;
							var item_qty = 1;
							//End
							
                            for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) { 
								
                         //       nlapiLogExecution('debug', 'count in loop', i); // Dinesh
                                var item = nlapiGetLineItemValue('item', 'item', i);
                                var itemType = nlapiGetLineItemValue('item', 'itemtype', i);
                         //       nlapiLogExecution('debug', 'itemType', itemType); // Dinesh
                                if (itemType == 'Discount')
                                    nlapiSetFieldValue('custbody_has_discount_items', 'T')
                                if (item != 0 && itemType != 'EndGroup' && itemType != 'GiftCert' && itemType != 'Discount' && itemType != 'OthCharge') { 
								
									nlapiSetLineItemValue('item', 'custcol_orderable_line_level_flag', i,'T')
                         //           nlapiLogExecution('debug', 'Processing Item', item); // Dinesh
                                    nlapiSelectLineItem('item', i)
                                    
									var custforms = ["304","305","306","307"]
									var custForm = nlapiGetFieldValue('customform')
									if(custforms.indexOf(custForm) != -1){
										if(nlapiGetFieldValue('custbody_lum_cust_segment') == 3 && 
													nlapiGetCurrentLineItemValue('item','price') == -1){
											//INTNS-2136 set each with Price Factor
											var priceFactor = nlapiGetFieldValue('custbody_price_factor')
											// Dinesh added code for INTNS-2556 -= code started
											var excludeS_H = nlapiGetFieldValue('custbody_exclude_s_h') 
										//	nlapiLogExecution('audit','excludeS_H',excludeS_H) // Dinesh
											if(priceFactor && priceFactor>0 &&  nlapiGetCurrentLineItemValue('item','custcol_purchase_price') >0 ){
												try{
											//		nlapiLogExecution('audit','priceFactor PostSourcing',priceFactor) // Dinesh
													if (excludeS_H == 'F'){
											//		nlapiLogExecution('audit','I am in if condition','Yes = I am in if condition')	// Dinesh
													nlapiSetCurrentLineItemValue('item','rate',(parseFloat(nlapiGetCurrentLineItemValue('item','custcol_purchase_price'))  * parseFloat(1.05) * parseFloat(priceFactor)).toFixed(2))
											//		nlapiLogExecution('audit','each with priceFactor',nlapiGetCurrentLineItemValue('item','rate')) // Dinesh
														
													}
													
													else{
											//			nlapiLogExecution('audit','I am in esle condition','Yes = I am in esle condition')	// Dinesh
													nlapiSetCurrentLineItemValue('item','rate',(parseFloat(nlapiGetCurrentLineItemValue('item','custcol_purchase_price')) * parseFloat(priceFactor)).toFixed(2))
											//		nlapiLogExecution('audit','each with priceFactor',nlapiGetCurrentLineItemValue('item','rate')) // Dinesh
													}
													
													// Dinesh added code for INTNS-2556 -= code Endded
												}catch(e){
													nlapiLogExecution('ERROR','Error Occured whicl setting Each with price factor',e)
												}
												
											}
										}           
									  }
										
                                    var s_ship_to_state = nlapiGetFieldValue('shipstate')
                                    s_ship_to_state = (s_ship_to_state == 'AK' || s_ship_to_state == 'HI' || s_ship_to_state == 'PR') ? s_ship_to_state : 'any'
                                    var shippingProfile = nlapiGetCurrentLineItemValue('item', 'custcol_ilt_shipping_profile');
                                    l_count++
                                    var freight = nlapiGetLineItemValue('item', 'custcol_lum_item_ships_freight', i)
                                    if (freight == 'T') {
                                        f_count++
                                    }
									
									   if (shippingProfile == 430) { // Added by Dinesh for INTNS-3258
                                        no_expedit_count++
                                    } // Added by Dinesh for INTNS-3258

                                    if (b && !nlapiGetLineItemValue('item', 'custcol_cseg_ilt_brand', i))
                                        nlapiSetCurrentLineItemValue('item', 'custcol_cseg_ilt_brand', b);
                                    // nlapiLogExecution('debug', 'Brnad',nlapiGetLineItemValue('item', 'custcol_cseg_ilt_brand', i));

                                    // To Make sure the Shipping Service Level and Shipping Profile is set for all the Lines.        
                                    try {

                                        var bu = nlapiGetFieldValue('custbody_cseg_ilt_busns_unit')
                                        var trandate = nlapiGetFieldValue('trandate')

                                        // Lumens Line level shipping is available only after 3/25/2018
                                        //if (bu == 1 || (bu == 2 && trandate > "3/25/2018"))  added by yogesh 10/04/2018 because unable to compare date with string
										if(bu == 1 || bu == 2)
										{

                                            if (!shippingProfile) {
                                          //      nlapiLogExecution('debug', 'No shipping Profile', 'Setting profile'); // Dinesh
                                                setShipProfile()
                                                shippingProfile = nlapiGetCurrentLineItemValue('item', 'custcol_ilt_shipping_profile')

                                            }
                                            if (shippingProfile == 413) {
                                                //   s_ship_to_state = 'any'

                                                if (s_ship_to_state == 'HI' || s_ship_to_state == 'PR')
                                                    s_ship_to_state = 'HIPR'

                                                upsShipCount++
                                            }
                                            var shippingMethod = nlapiGetCurrentLineItemValue('item', 'custcol_ilt_ship_service_level')
                                            if (!shippingMethod) {
                                           //     nlapiLogExecution('debug', 'No shippingMethod', 'Setting shippingMethod'); // Dinesh
                                                nlapiSetCurrentLineItemValue('item', 'custcol_line_level_ship_state', s_ship_to_state, true, true);
                                                setSSLValues()
                                                shippingMethod = nlapiGetCurrentLineItemValue('item', 'custcol_ilt_ship_service_level')
                                            }
                                            finalCost()
                                        var freeIf75;
                                        var shipcarrier 
                                        if(shippingMethod){
                                            var shipVals = nlapiLookupField('customrecord_ship_profile_method',shippingMethod,['custrecord_ilt_free_if_75','custrecord_ilt_ship_carrier'])
                                           if(shipVals){
                                            freeIf75 = shipVals.custrecord_ilt_free_if_75
                                            shipcarrier = shipVals.custrecord_ilt_ship_carrier
                                           }
                                            if (shippingMethod == 1834 || freeIf75 == 'T') {
                                                    var itemCost = nlapiGetLineItemValue('item', 'amount', i)
                                                    free_75_cost = parseFloat(free_75_cost) + parseFloat(itemCost)
                                             //       nlapiLogExecution('audit', 'free_75_cost ', free_75_cost); // Dinesh
                                            }
                                          }

                                        }
                                        if (rectype == 'salesorder') {

                                            var isClosed = nlapiGetLineItemValue('item', 'isclosed', i);
                                            var cDate = nlapiGetLineItemValue('item', 'custcol_1st_closed', i);
                                            var qty = nlapiGetLineItemValue('item', 'quantity', i);
                                            var shipQty = nlapiGetLineItemValue('item', 'quantityfulfilled', i);
                                            if ((isClosed == 'T' && !cDate && (qty = !shipQty))) {
                                      //          nlapiLogExecution('debug', 'Setting Closed Date', '') // Dinesh
                                                nlapiSetCurrentLineItemValue('item', 'custcol_1st_closed', closedDate, true, true)
                                            }

                                        }
                                    } catch (e) {
                                        nlapiLogExecution('error', 'error processing new line item', e)
                                    }

									
									if(!nlapiGetCurrentLineItemValue('item','custcol_ilt_shipping_carrier') && shipcarrier){
									//	nlapiLogExecution('debug','custrecord_ilt_ship_carrier is empty','Setting value') // Dinesh
                                        nlapiSetCurrentLineItemValue('item','custcol_ilt_shipping_carrier',shipcarrier)
									}
									
									//Naga did changes for INTNS-3305
									item_qty = nlapiGetLineItemValue('item','quantity',i); 
									nlapiLogExecution('audit', 'hc item_qty1', item_qty)
									if(item_qty != '' && item_qty != null && item_qty > 0){
										nlapiLogExecution('audit', 'hc item_qty2', 'ffff')
										
										//handlingcost = nlapiLookupField('inventoryitem',nlapiGetLineItemValue('item','item',i),'handlingcost')
										/* var itemInfo = nlapiLoadRecord("inventoryitem",nlapiGetLineItemValue('item','item',i));
										handlingcost = itemInfo.getFieldValue('handlingcost');
										nlapiLogExecution('audit', 'hc handlingcost', handlingcost+"==="+nlapiGetLineItemValue('item','item',i)) */
										var handlingcost = nlapiGetCurrentLineItemValue('item','custcol_handling_cost');
										if(handlingcost != '' && handlingcost != null && handlingcost > 0){
											final_handling_cost += parseFloat(item_qty)*parseFloat(handlingcost)
										}									
									}
									nlapiLogExecution('audit', 'hc item_qty3', handlingcost)
									if(handlingcost>0){ 
									//swapna commented for 3390
										
										nlapiSetCurrentLineItemValue('item','custcol_total_handling_cost',(parseFloat(handlingcost) * parseFloat(item_qty)).toFixed(2))
										
										nlapiLogExecution('audit', 'handlingcost>0', (parseFloat(handlingcost) * parseFloat(item_qty)).toFixed(2))
									}
									//End 
                                    nlapiCommitLineItem('item');
                                  
                                }
                                else
                                {
                                    //nlapiLogExecution('error', 'Not Inventory Item to process. ItemType ==>', itemType)
                                } 
                            }
							
							//Naga changes for INTNS-3305
							nlapiLogExecution('AUDIT','final_handling_cost',final_handling_cost)
								if(final_handling_cost>0){
									nlapiSetFieldValue('handlingcost', parseFloat(final_handling_cost));
								}
							//End
							
						//	nlapiLogExecution('debug','*****Added Discounts *******',nlapiGetLineItemCount('item')) // Dinesh
                             
                                for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) {
                                    var itemType = nlapiGetLineItemValue('item', 'itemtype', i);    
                                   if (itemType != 'EndGroup' && itemType != 'GiftCert' && itemType != 'Discount' && itemType != 'OthCharge'){
                                   
                                    var freeIf75;
                                    var shippingMethod = nlapiGetLineItemValue('item', 'custcol_ilt_ship_service_level', i)
                                    
                                    if (shippingMethod)
                                        freeIf75 = nlapiLookupField('customrecord_ship_profile_method', shippingMethod, 'custrecord_ilt_free_if_75')
                                        
                                        if (shippingMethod == 1834 || freeIf75 == 'T') {
                                        if (free_75_cost > 0 && free_75_cost < 99.99){
                                        var itemCost = nlapiGetLineItemValue('item', 'amount', i)
                                        if(parseFloat(itemCost) < 99.99){
                                             
                                        var ship_cost = parseFloat((parseFloat(14.99) * parseFloat(itemCost)) / free_75_cost) 			  
                                        nlapiSetLineItemValue('item', 'custcol_ilt_shipping_cost', i,parseFloat(ship_cost))
                                        }
                                      
                                    }
                                    }
                                    
                                    var OverrideShippCost = nlapiGetLineItemValue('item', 'custcol_override_shipcost', i);
                                    var f_shippingcost = nlapiGetLineItemValue('item', 'custcol_ilt_shipping_cost', i);
                                    if(OverrideShippCost && OverrideShippCost >= 0)
                                        f_shippingcost = OverrideShippCost

                                  //  nlapiLogExecution('debug', 'f_shippingcost on Item :' + item, f_shippingcost)
                                    if (f_shippingcost && f_shippingcost >= 0) {
                                        new_shippingcost = parseFloat(new_shippingcost) + parseFloat(f_shippingcost);
                                 //       nlapiLogExecution('debug', 'new_shippingcost for Item:' + item, new_shippingcost);   // Dinesh                                   
                                    }									
									
                                    var sslMeth = nlapiGetLineItemValue('item', 'custcoll_ilt_ship_method',i)
                                    if(sslMeth && !nlapiGetLineItemValue('item', 'custcol_ship_meth_for_po',i)){
                                       var methPO = nlapiLookupField('customrecord_ilt_ship_service_level', sslMeth, 'custrecord_ilt_m_ship_meth_code');
                                      if(methPO)
                                      nlapiSetLineItemValue('item', 'custcol_ship_meth_for_po',i,methPO)
                                    }

                                }
                                }
						   
								//Per INTNS-1479 and a discount item below the current Item if it is GWP Item
								var remove_discos = nlapiGetFieldValue('custbody_remove_discos')
								for(var i=nlapiGetLineItemCount('item'); 1 <= i; i--){
									var i_itemid = nlapiGetLineItemValue('item','item',i)
									var lcf = nlapiLookupField('inventoryitem', i_itemid,'custitem_product_lifecycle_status')
									//INTNS-1991 remove the Discontinued or Suspended Items, if customer confirms to proceed
								if(remove_discos && remove_discos.indexOf("Remove Disco Items") != -1 && (lcf == 3 || lcf == 4)){
									nlapiSelectLineItem('item',i)
								//	nlapiLogExecution('audit', 'Item selected ', 'ITem Line :'+i) // Dinesh
									nlapiRemoveLineItem('item',i)
								//	nlapiLogExecution('audit', 'Item remvoed ', 'ITem Line :'+i) // Dinesh
								}
									
									
									
		 
                                var disc_added = nlapiGetLineItemValue('item', 'custcol_gwp_disc_added', i)
								if(nlapiGetLineItemValue('item', 'custcol_gwp_item', i) == 'T' && (disc_added == 'F' ||disc_added == '' || !disc_added) && nlapiGetLineItemValue('item', 'itemtype', i+1) != 'Discount'){
								//	nlapiLogExecution('debug','Adding Discount Item for :'+nlapiGetLineItemValue('item','item',i),'') // Dinesh
								var amount = nlapiGetLineItemValue('item', 'amount', i)
								var qty = nlapiGetLineItemValue('item', 'quantity', i)
								
								if(i == nlapiGetLineItemCount('item'))	{
									nlapiLogExecution('audit','Selecting New Line 805','i = '+i+' ; '+nlapiGetLineItemCount('item')) // Dinesh
                                    nlapiSelectNewLineItem('item');
                                    								// set the item and location values on the currently selected line
								nlapiSetCurrentLineItemValue('item', 'item',409201);
								nlapiSetCurrentLineItemValue('item','price',-1)
								
								//per INTNS-1685 Discount should be added to only 1 Qty
								nlapiSetCurrentLineItemValue('item', 'amount',-parseFloat(amount));

								// commit the line to the database
                                nlapiCommitLineItem('item');
                                nlapiSetLineItemValue('item', 'custcol_gwp_disc_added', i,'T')
								nlapiSetLineItemValue('item','custcol_ilt_shipping_cost','0.00')
								}
								else{
									nlapiLogExecution('audit','Inserting New Line 820','i = '+i+' ; '+nlapiGetLineItemCount('item')) // Dinesh
									nlapiInsertLineItem('item', i+1)
									//nlapiSelectNewLineItem('item');
								
								// set the item and location values on the currently selected line
								nlapiSetLineItemValue('item', 'item', i+1,409201);
								nlapiSetLineItemValue('item','price',i+1,-1)
								//per INTNS-1685 Discount should be added to only 1 Qty
								nlapiSetLineItemValue('item', 'amount', i+1,-parseFloat(amount));
                                nlapiSetLineItemValue('item', 'custcol_gwp_disc_added', i,'T')
								// commit the line to the database
								//nlapiCommitLineItem('item');
							//	nlapiLogExecution('debug','Discount Item Added with Amount :',amount) // Dinesh
								 
								}
								}
								}
								
								//Added by Yogesh for INTNS-1859 Check GWP = TRUE when user adds GWP discount to line item below
								var rec_type=nlapiGetRecordType();
								
								if(rec_type=='salesorder' || rec_type=='estimate')
								{
									var count=nlapiGetLineItemCount('item');
									
									for(var i=0;i<count;i++)
									{
										var item_id=nlapiGetLineItemValue('item','item',i+1);
										
										if(item_id==7644582)
										{
									//		nlapiLogExecution('Debug', 'Item Id '+i, item_id); // Dinesh
											
											var t_itemId=nlapiGetLineItemValue('item','custcol_gwp_item',i)
									//		nlapiLogExecution('Debug', 'Item Value', t_itemId); // Dinesh
											
											var item_type=nlapiGetLineItemValue('item','itemtype',i)
									//		nlapiLogExecution('Debug', 'Item Type', t_itemId); // Dinesh
											
											if(t_itemId=='F' && item_type=='InvtPart')
												nlapiSetLineItemValue('item','custcol_gwp_item',i,'T')
											
											if(t_itemId=='F' && item_type=='EndGroup')
												nlapiSetLineItemValue('item','custcol_gwp_item',i-1,'T')
										}
									}
								}
						   
						   
                            nlapiSetFieldValue('custbody_total_items', l_count)
                            nlapiSetFieldValue('custbody_total_freight_items', f_count)
							//If f_count>0 then custbody_freight_item_on_order=T (INTNS-2711)
						//	 nlapiLogExecution('audit', 'custbody_freight_item_on_order Before IF', nlapiGetRecordId());  // Dinesh
						
						if (no_expedit_count > 0){ // Added by Dinesh for INTNS-3258
								nlapiSetFieldValue('custbody_dont_send_freight_email','T');
							}
						
							if (f_count > 0){
                        //        nlapiLogExecution('audit', 'custbody_freight_item_on_order', 'T ' +nlapiGetRecordId()); // Dinesh
								nlapiSetFieldValue('custbody_freight_item_on_order','T');
							}
                            if (new_shippingcost >= 0)
                                nlapiSetFieldValue('shippingcost', parseFloat(new_shippingcost));
							//Per INTNS-1898 No change to handlingcost 
                            //if (upsShipCount == 0)
                              //  nlapiSetFieldValue('handlingcost', 0.00)
                        }
						
                    }
                } else
                    nlapiLogExecution('debug', 'Business Unit is null', busU);

            } catch (e) {
                nlapiLogExecution('error', 'error while processing', e);
            }
        }
        if (rectype == 'estimate' || rectype == 'salesorder' || rectype == 'purchaseorder' || rectype == 'returnauthorization') {
            var brand = nlapiGetFieldValue('custbody_cseg_ilt_brand');
            var customerSegment
            if (rectype == 'purchaseorder')
                customerSegment = nlapiGetFieldValue('custbody76');
            else
                customerSegment = nlapiGetFieldValue('custbody_lum_cust_segment');

            var emailTemplate = nlapiGetFieldValue('custbody_trans_email_fields');
         //   nlapiLogExecution("debug", "Brand Seg and emailTemp", brand + ". " + customerSegment + ". " + emailTemplate);
            if (!customerSegment)
                customerSegment = 1
          
          //commenting as per INTNS 1631
           // if (!emailTemplate)
           {
                if (customerSegment && brand) {
                    var filters = [];
                    filters[0] = new nlobjSearchFilter('custrecord_customer_seg', null, 'is', customerSegment);
                    filters[1] = new nlobjSearchFilter('custrecord_brand', null, 'is', brand);

                    var srch = nlapiSearchRecord('customrecord_email_template_fields', null, filters, null);
                    if (srch && srch.length == 1) {
                        nlapiSetFieldValue('custbody_trans_email_fields', srch[0].getId(), true, true);
                    }
                }
            }

            if (type == 'create' && rectype == 'returnauthorization') {

                var returnCost = nlapiGetFieldValue('custbody_return_ship_cost')
                if (returnCost) {
              //      nlapiLogExecution('debug', 'Adding Returns Shipping ITem with  cost', returnCost)  // Dinesh
                    nlapiSelectNewLineItem('item')
                    nlapiSetCurrentLineItemValue('item', 'item', 25)
                    nlapiSetCurrentLineItemValue('item', 'rate', -returnCost)
                    nlapiSetCurrentLineItemValue('item', 'location', nlapiGetLineItemValue('item', 'location', 1))
                    nlapiCommitLineItem('item')
            //        nlapiLogExecution('debug', 'commited ITem', '') // Dinesh
                } else {
                    nlapiLogExecution('debug', 'No returnCost Shipping Cost', returnCost)
                }

            }
        }
        return true;
    } catch (e) {
        nlapiLogExecution("error", "error", e);
    }
}



}
// Added by Dinesh for INTNS-3046 code -- start -- Part -I
function balance_owed(type){
//	nlapiLogExecution('Audit', 'I am in balance_owed function','I am in balance_owed function')
	var rectype = nlapiGetRecordType();	
	var recID = nlapiGetRecordId();
//	nlapiLogExecution('Audit', 'type',type)
	
	try{		
		if(rectype == 'salesorder') {	
		var so_record = nlapiLoadRecord(rectype,recID);		
		var so_shipcountry = so_record.getFieldValue('shipcountry')
		nlapiLogExecution('Audit', 'so_shipcountry',so_shipcountry)
		var so_customform = so_record.getFieldValue('customform')
		var so_total = 00; 	
		if(so_customform != 256 || so_customform != 268){
		if(so_shipcountry == 'CA'){
				 so_total = so_record.getFieldValue('custbody_total_so_amount')
				 nlapiLogExecution('Audit', 'so_total for Canada', so_total)
			}else{
				so_total = so_record.getFieldValue('total')
				 nlapiLogExecution('Audit', 'so_total', so_total)
			}
		}
		so_record.setFieldValue('custbody_balance_owed',so_total)
		
			var so_submit = nlapiSubmitRecord(so_record, true, false);
			nlapiLogExecution('Audit','so_submit',so_submit);
	
	}
	
	}
	catch(e){
		
		nlapiLogExecution('error','Error',e)
	}
	
}
// Added by Dinesh for INTNS-3046 code -- Endded -- Part -I



// END BEFORE SUBMIT

function afterSubmitRecord_setheaderfields(type) {
	
	// Added by Dinesh for INTNS-3046 code -- start -- Part -II
	var rectype = nlapiGetRecordType();	
	var recID = nlapiGetRecordId();	
	if(rectype == 'salesorder' && type == 'create'){
	//	nlapiLogExecution('Audit', 'I am in balance_owed if condition','I am in balance_owed if condition')
		balance_owed();
	//	nlapiLogExecution('Audit', 'type',type)
		
	}
	// Added by Dinesh for INTNS-3046 code -- Endded -- Part -II
	//Naga added this for INTNS-2566
	var custbody_send_notification_emails = nlapiGetFieldValue('custbody_send_notification_emails');
//	nlapiLogExecution('debug', 'Email JOB custbody_send_notification_emails', custbody_send_notification_emails); // Dinesh
	if(rectype == 'estimate' && custbody_send_notification_emails == 'T'){
		sendContractJobEmailNotificationsNew();

		try{
			var rec = nlapiLoadRecord(rectype, recID);			
			rec.setFieldValue('custbody_send_notification_emails', 'F');
			rec.setFieldValue('custbody_notification_emails_sent', '1');
			nlapiSubmitRecord(rec, true, false);
		}catch(e)
		{
			nlapiLogExecution('error','Proposal Contract email error',e.message);
		}
	}
	//End
	
	//Naga added this for INTNS-3152
	var contact = nlapiGetContext();
	var role_id = contact.getRole();
	var role_name = contact.getRoleId();
	var context = nlapiGetContext();
	var excutution_context = context.getExecutionContext();
	//nlapiLogExecution('audit','role_id',role_id); //1075 - Lumens staff accountant - Full Accesss
	var createdfrom = nlapiGetFieldValue('createdfrom') //Check if proposal then this should not be empty
	//type == 'create' &&   && role_id == 1075
	if((rectype == 'estimate' || rectype == 'salesorder' || rectype == 'cashsale' || rectype == 'returnauthorization') && excutution_context == 'userinterface'){
		var rec = nlapiLoadRecord(rectype, recID);
		updateProposalTaxForExemptCustomer(rec);
	}
	
		// Dinesh added for Freight Item Banner on LR --- Start ---
	
		if ( rectype == 'returnauthorization') {
		var recID_lr = nlapiGetRecordId();
		var rec_lr = nlapiLoadRecord(rectype, recID);	
		 nlapiLogExecution("debug", "rec_lr",rec_lr);
		   // Added by Dinesh for INTNS-3187 code -- Start--
		 var forms_name = rec_lr.getFieldValue('customform')
		 var lable_field = rec_lr.getFieldValue('custbody_reprint_return_label')
		 if(forms_name == 233 ){
			 if(lable_field == null || lable_field =='') {
				 rec_lr.setFieldValue('custbody_issue_call_tags', 'T');
			 }
			 
		 }


//Code from Atna for testing
var transactionSearch = nlapiSearchRecord("transaction",null,
[
  ["internalid","anyof",recID_lr], 
  "AND",
   ["item.type","noneof","Discount"], 
   "AND", 
   ["cogs","is","F"], 
   "AND", 
   ["mainline","is","F"], 
   "AND", 
   ["taxline","is","F"], 
   "AND", 
   ["shipping","is","F"]
], 
[
   new nlobjSearchColumn("internalid"), 
   new nlobjSearchColumn("item"), 
   new nlobjSearchColumn("netamount"), 
   new nlobjSearchColumn("line"), 
   new nlobjSearchColumn("type","item",null),
   new nlobjSearchColumn("custcol_cancel_qty"), 
   new nlobjSearchColumn("quantity")
]
);
var finalItemObj={};

for(x=0;x<transactionSearch.length;x++)
 {
     var itemObj={};
      itemObj.item=transactionSearch[x].getValue('item');
   itemObj.lineId=transactionSearch[x].getValue('line');
   itemObj.netAmount=transactionSearch[x].getValue('netamount');

 var cancelQty=transactionSearch[x].getValue('custcol_cancel_qty');
   var actualQty=transactionSearch[x].getValue('quantity');
   if(cancelQty==0)
   {
    itemObj.netAmount=transactionSearch[x].getValue('netamount');
}
else
{
    if(actualQty==cancelQty){
         itemObj.netAmount=0;}
     else
     {
       var discountedRate=transactionSearch[x].getValue('netamount')/actualQty;
        itemObj.netAmount=discountedRate*(actualQty-cancelQty);
     }
}

    itemObj.type=transactionSearch[x].getValue('type','item');
    nlapiLogExecution("debug", "itemObj",itemObj);
 finalItemObj[itemObj.lineId]=itemObj
 }
        nlapiLogExecution("debug", "finalItemObj",JSON.stringify(finalItemObj));

//Code from Atna for testing ends




		 // Added by Dinesh for INTNS-3187 code -- End--
		var count_item = nlapiGetLineItemCount('item');
		nlapiLogExecution("debug", "count_item",count_item);
		var freight_count_number = 0;		
		   for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) {
			   var lr_lineType = rec_lr.getLineItemValue('item', 'itemtype',i);	
			//	nlapiLogExecution("debug", "lr_lineType", lr_lineType);
				if(lr_lineType == 'InvtPart'){
					nlapiLogExecution("debug", "I am in if condition",'I am in if condition');
					var LR_item = rec_lr.getLineItemValue('item','item',i);
			//		 nlapiLogExecution("debug", "LR_item",LR_item);		

//Code from Atna for testing start
var LR_itemLine = rec_lr.getLineItemValue('item','line',i);
nlapiLogExecution("debug", "LR_itemLine-",LR_itemLine);

var itemFound = finalItemObj[LR_itemLine];

nlapiLogExecution("debug", "itemFound-net amount",itemFound.netAmount);
//Code from Atna for testing ends
					 }				
                var freight_count = nlapiGetLineItemValue('item', 'custcol_lum_item_ships_freight', i)
			//	nlapiLogExecution('Audit', 'freight_count - LR ', freight_count); // Dinesh
                                    if (freight_count == 'T') {
                                        freight_count_number++										
								//	 nlapiLogExecution('Audit', 'freight_count_number - LR ', freight_count_number);    // Dinesh                                 
									 rec_lr.setFieldValue('custbody_lr_freight_items', freight_count_number)
									
      }
	// Dinesh added for INTNS-2996 -- Start--
	  
	  	//  	var forms_name = rec_lr.getFieldValue('customform') // moved to up this line for INTNS-3187
	//	nlapiLogExecution("debug", "forms_name",forms_name);
	if(forms_name == 233 || forms_name == 235){
	var so_created_id =rec_lr.getFieldValue('createdfrom') 
	if(so_created_id){
	nlapiLogExecution("debug", "so_created_id",so_created_id);
	var so_load = nlapiLoadRecord('salesorder',so_created_id);
	var salesorderLineCount = so_load.getLineItemCount('item')
//	nlapiLogExecution("debug", "salesorderLineCount", salesorderLineCount);		
		var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
				[
				   ["type","anyof","PurchOrd"], 
				   "AND", 
				   ["createdfrom.internalidnumber","equalto",so_created_id], 
				   "AND", 
				   ["item.internalidnumber","equalto",LR_item],
				   				   "AND", 
				["item.type","anyof","InvtPart","NonInvtPart"]
				], 
				[
				   new nlobjSearchColumn("tranid")
				]
				);
	
		if(purchaseorderSearch){
				var look_po = purchaseorderSearch[0].getId();
				nlapiLogExecution("debug", "look_po",look_po);
					if(look_po){
				rec_lr.setFieldValue('custbody_lr_purchase_order_no', look_po);
			 	if(lr_lineType == 'InvtPart'){
			 	rec_lr.setLineItemValue('item','custcol_p_num',i,look_po);				
				}
				}
			}
	

	}
		}
				 
	}	

	
	nlapiSubmitRecord(rec_lr, true, false);
	}
	// Dinesh added for Freight Item Banner on LR --- End ---
	
	// Dinesh added for INTNS-2996  --- End ---
	
  	// Added by Dinesh for Payment profile issues code --- start---
	
	
	//INTNS-2984 
	//if (rectype == 'salesorder'){
		var srec = nlapiLoadRecord(rectype,recID); 
		var so_line_count=srec.getLineItemCount('item'); 
		var prom_price = 0;
		var net_price = 0;
		var ncount = 0; 
		var box_weight = parseFloat("0.25");
		var package_weight =  parseFloat("0");
		var surepostcheck = false;
		var groundcheck = false;
		var isstockPO = nlapiGetFieldValue('custbody_is_combo_order');
		for(var i=1;i<=so_line_count;i++)
		{ 
			var item_type=nlapiGetLineItemValue('item','itemtype',i)
		/*	var ingroup = nlapiGetLineItemValue('item','ingroup',i)
			prom_price = getItemPromotionPrice(i,so_line_count,srec);  
			
			if(item_type!='EndGroup' && ingroup!='T' && item_type != "Group"){ //InvtPart
				var item_iprice = srec.getLineItemValue('item','amount',i);				
				net_price = (parseFloat(item_iprice)-parseFloat(prom_price)).toFixed(2);
				
				if(srec.getFieldValue('discountrate')!="" && srec.getFieldValue('discountrate') != null && net_price>0){
					var disc = srec.getFieldValue('discountrate').replace('%',"");
					if(srec.getFieldValue('discountrate').indexOf('%') !== -1 && disc<0){
						var discount = ((parseFloat(net_price)*parseFloat(disc))/100);
						net_price = (parseFloat(net_price)+parseFloat(discount)).toFixed(2); 
						//nlapiLogExecution('debug', 'Sravano After discount', net_price)
					}
				}				
				//nlapiLogExecution('debug', 'Sravano 1066', i+"=="+net_price+"=="+prom_price+"=="+promo_data) 
				if(net_price>=0 && rectype != 'purchaseorder'){ 			 
					srec.setLineItemValue('item','custcol_net_amount',i,net_price); 
					ncount = ncount+1
				} 
			}else if(item_type == "Group" && rectype != 'purchaseorder'){
					ncount = ncount+1
					net_price = getPgItemPromotionPrice(i,so_line_count,srec);
					srec.setLineItemValue('item','custcol_net_amount',i,net_price); 	
				}				
					
			*/
		//INTNS-2984 END
		
			//Naga changes for INTNS-2750
			var ship_service_level = srec.getLineItemValue('item','custcol_ilt_ship_service_level',i)
			if(rectype == 'purchaseorder' && item_type == 'InvtPart'){
				var vendor = srec.getLineItemValue('item','custcol_vendor',i);
				var quantity =  srec.getLineItemValue('item','quantity',i);
				var itemWeight = nlapiLookupField('item',nlapiGetLineItemValue('item','item',i),'custitem_lum_package_weight_val');
				package_weight = ((parseFloat(itemWeight)*quantity)+parseFloat(box_weight)).toFixed(2);
				if(package_weight<=2.99){
					var ship_method = 9507282; //Surepost
					surepostcheck = true; 
				}
				if(package_weight>2.99){
					var ship_method = 67;
					groundcheck = true; 
				} 
				
				if(vendor && vendor.toLowerCase() == 'bulbrite' && ship_service_level ==1834 && isstockPO != 'T'){
					ncount = ncount+1
					srec.setLineItemValue('item','custcol_ship_meth_for_po',i,ship_method);
				}
			}
			//Naga changes done //67 - Ground, 9442437 - Dev Surepost , 9507282 - Prod Surepost
		}
		if(ncount>0){
			if(ship_service_level ==1834 && isstockPO != 'T'){
				if(groundcheck){
					srec.setFieldValue('custbody_carrier_name',1);
				}
				if(!groundcheck && surepostcheck){
					srec.setFieldValue('custbody_carrier_name',214);
				}
			}
			nlapiSubmitRecord(srec, true, false);	
		}
			
	//} 
	//End
	
	/*var context_pro = nlapiGetContext(); // Dinesh
	var excutution_context_pro = context_pro.getExecutionContext(); // Dinesh
    //nlapiLogExecution("Audit", "excutution_context_pro",excutution_context_pro);	
	var busU_pro = nlapiGetFieldValue('custbody_cseg_ilt_busns_unit');
	//nlapiLogExecution("Audit", "busU_pro",busU_pro);
	if( (rectype == 'salesorder') && (type == 'create' || type == 'copy') && (excutution_context_pro == 'userinterface')){
	var rectype_pro = nlapiGetRecordType();	
	var recID_pro = nlapiGetRecordId();
	var so_load_pro = nlapiLoadRecord('salesorder',recID_pro);
					nlapiLogExecution('Audit', 'I am in after record submit - type == create && excutution_context == userinterface -if', type);
                if (busU_pro) {
                    if (busU_pro == '2') {
						so_load_pro.setFieldValue('creditcardprocessor', 5) 
                      //  nlapiSetFieldValue('creditcardprocessor', 1) // lumens new(5) old(1)
						nlapiLogExecution('Audit', 'I am settting new profile in after submit', 'I am settting new profile in after submit');
                  
                    } else {
						so_load_pro.setFieldValue('creditcardprocessor', 6)
                    //    nlapiSetFieldValue('creditcardprocessor', 3) // Y Lighitng  lumens new(6) old(3)
						nlapiLogExecution('Audit', 'I am settting new profile in after submit', 'I am settting new profile in after submit');						
                    }

                } else{
                    nlapiLogExecution('Audit', 'Business Unit is null - type == create && excutution_context == userinterface -else', type);
				}
			nlapiSubmitRecord(so_load_pro, true, false); 
	}*/
	
	// Added by Dinesh for Payment profile issues code --- Endded---  
	
	if(rectype != 'cashsale' && rectype != 'cashrefund'){
  //  nlapiLogExecution('debug', 'after', type); // Dinesh
    if (type == 'create' && (rectype == 'customer' || rectype == 'prospect' || rectype == 'lead')) {

        var recID = nlapiGetRecordId();

        var context = nlapiGetContext();
   //     nlapiLogExecution("debug", "context", context); // Dinesh
        var excutution_context = context.getExecutionContext();

        var str_prefix = '';

        var objcustomer = nlapiLoadRecord(rectype, parseInt(recID));
      //  nlapiLogExecution('debug', 'objcustomer', objcustomer); // Dinesh
    //    nlapiLogExecution('audit', 'salesrep AS before', objcustomer.getFieldValue('salesrep') + ':' + objcustomer.getFieldText('salesrep')); // Dinesh

        var i_businessUnit = objcustomer.getFieldValue('custentity_cseg_ilt_busns_unit'); //Suresh: Business Unit field is changed. 
    //    nlapiLogExecution('debug', 'i_businessUnit', i_businessUnit); // Dinesh

        var cust_Segment = objcustomer.getFieldValue('custentity_lum_cust_segment');
        var price_Level = '';

        if (_logValidation(i_businessUnit)) {

            if (i_businessUnit == 2) { //lumens 
                str_prefix = 'L';
                var new_id = getUniqueCustomerNumber();
                // var new_entity_id = str_prefix + current_number;
                var new_id_id = str_prefix + new_id;
           //     nlapiLogExecution('debug', 'new_entity_id', new_id_id); // Dinesh

                objcustomer.setFieldValue('entityid', new_id_id);
                if (cust_Segment == 2) // for Price Level
                    price_Level = 9;


            } else if (i_businessUnit == 1) { // y group 
                str_prefix = 'Y';

                var new_id = getUniqueCustomerNumber();
                // var new_entity_id = str_prefix + current_number;
                var new_id_id = str_prefix + new_id;
           //     nlapiLogExecution('debug', 'new_entity_id', new_id_id); // Dinesh
                objcustomer.setFieldValue('entityid', new_id_id);
                if (cust_Segment == 2) // for Price Level
                    price_Level = 20;
            }

            if (cust_Segment == 1) // for Price Level 
                price_Level = 8;
            // objcustomer.setFieldValue('pricelevel',price_Level);	
        }

   //     nlapiLogExecution('audit', 'salesrep AS after', objcustomer.getFieldValue('salesrep') + ':' + objcustomer.getFieldText('salesrep')); // Dinesh

        var custID = nlapiSubmitRecord(objcustomer, true, true);

   //     nlapiLogExecution('audit', 'salesrep AS after after', nlapiLookupField(nlapiGetRecordType(), nlapiGetRecordId(), 'salesrep')); // Dinesh


    }
    //var rectype = nlapiGetRecordType();



    return true;
   }
}



// END BEFORE SUBMIT ==================================================


// BEGIN AFTER SUBMIT =============================================



// END AFTER SUBMIT ===============================================

function _logValidation(value) {
    if (value != null && value.toString() != null && value != '' && value != undefined && value.toString() != undefined && value != 'undefined' && value.toString() != 'undefined' && value.toString() != 'NaN' && value != NaN) {
        return true;
    } else {
        return false;
    }
}

// BEGIN FUNCTION ===================================================
{



}
// END FUNCTION =====================================================

function getUniqueCustomerNumber() {
    var r = nlapiSearchRecord('customrecord_customer_number', null, null, new nlobjSearchColumn('custrecord_next_number', null, 'max'));
    var lastNumber = parseInt(r[0].getValue('custrecord_next_number', null, 'max'), 10) || 0;

//    nlapiLogExecution('debug', 'found last customer number', lastNumber); // Dinesh

    while (nlapiGetContext().getRemainingUsage() > 6) {
        try {
            ++lastNumber;
        //    nlapiLogExecution('debug', 'attempting new customer number', lastNumber); // Dinesh

            var numberRecord = nlapiCreateRecord('customrecord_customer_number');
            numberRecord.setFieldValue('custrecord_next_number', lastNumber);
            numberRecord.setFieldValue('externalid', lastNumber.toString());
            nlapiSubmitRecord(numberRecord);

            return lastNumber.toString();
        } catch (e) {
            // try next order number
        }
    }

    throw 'could not generate unique customer number';
}



//Naga added this for INTNS-2468
function marketPlaceFun(){
	
var rectype = nlapiGetRecordType();
		var market_place = nlapiGetFieldValue('custbody_web_store_id');
	if ((rectype == 'cashsale' || rectype == 'salesorder' || rectype == 'returnauthorization' || rectype == 'cashrefund') && (market_place == 1 || market_place == 2 || market_place == 3)){
	//	nlapiLogExecution('debug', 'Mplace rectype', rectype); // Dinesh
		var market_tax = 0;
		for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) {
			if(nlapiGetLineItemValue('item','custcol_market_place_order_tax',i) && nlapiGetLineItemValue('item','custcol_market_place_order_tax',i)>0){
			market_tax +=parseFloat(nlapiGetLineItemValue('item','custcol_market_place_order_tax',i));
	//		nlapiLogExecution('debug', 'Mplace market_tax', market_tax); // Dinesh
			}
		}
		nlapiSetFieldValue('taxamountoverride', market_tax);	
	//	nlapiLogExecution('debug', 'Mplace market_tax 1', market_tax);	 // Dinesh	
	}
}	
//Naga code end	

//Not using for OR-98
//Naga added this code for INTNS-2550 (This will trigger record creation time)
function promotionsOnPageLoad(type){ 
// nlapiLogExecution('debug', 'Naga promotionsOnPageLoad', type) // Dinesh
    var rectype = nlapiGetRecordType();	
	var recid = nlapiGetRecordId() > 0 ? nlapiGetRecordId() : '0';
	var final_promo_price = 0;
	
	var itemsCount = nlapiGetLineItemCount('item');
//	nlapiLogExecution('debug', 'Naga itemsCount', itemsCount)	 // Dinesh
	
	//INTNS-2552 Changes for Image URL update in Line level
	var salesrep = nlapiGetFieldText('salesrep');
//	nlapiLogExecution('DEBUG','Image URL:salesrep',salesrep) // Dinesh		
	if((rectype == 'salesorder' || rectype == 'purchaseorder' || rectype == 'estimate' || rectype == 'returnauthorization') && itemsCount>0 && salesrep != 'Web Order'){
		for(j=1;j<=itemsCount;j++){
		//	nlapiLogExecution('DEBUG','Image URL:Naga','Entered') // Dinesh
			var itemId = nlapiGetLineItemValue('item','item',j);
			var itemUrl = nlapiGetLineItemValue('item','custcol_item_image_url',j);
			if(itemId && itemUrl == null){
				var imageId = nlapiLookupField('item',itemId,'custitem_imageid');
				if(imageId != null){
					nlapiSetLineItemValue('item','custcol_item_image_url',j,imageId);
				}
			}											
		}
	}
	//INTNS-2552 changes end
	
	/* if(rectype == 'salesorder'){
		try
		{ 
			if(itemsCount>0){ 
			    //var quantity = nlapiGetLineItemValue('item','quantity',i)
				var custcol_promo_name = nlapiGetLineItemValue('item','custcol_promo_name',itemsCount)
				nlapiLogExecution('debug', 'Naga custcol_promo_name', custcol_promo_name) 
					
				var custcol_promo_details = nlapiGetLineItemValue('item','custcol_promo_details',itemsCount)	
				if(custcol_promo_details){
					var jdata = JSON.stringify(custcol_promo_details);
					var promotionData = JSON.parse(custcol_promo_details)					
					var sdetails = promotionData.details;					
					if(promotionData.ptype == 'orderlevel'){
						if (sdetails != null && sdetails !=undefined) {
							slength = sdetails.length;     
						}
						nlapiLogExecution('debug', 'Naga itemsCount', itemsCount)
						nlapiLogExecution('debug', 'Naga custcol_promo_name', custcol_promo_name)
						nlapiLogExecution('debug', 'Naga custcol_promo_details', custcol_promo_details)
						
						nlapiLogExecution('DEBUG','canadaPromotionsOnPageLoad: jdata',jdata)
						nlapiLogExecution('DEBUG','canadaPromotionsOnPageLoad: ptype',promotionData.ptype)
						nlapiLogExecution('DEBUG','canadaPromotionsOnPageLoad: sdetails',sdetails)
						nlapiLogExecution('DEBUG','canadaPromotionsOnPageLoad: slength',slength)
						
						for(p=0;p<slength;p++){
							promo_price = sdetails[p]['pprice'];
							var promo_pid = sdetails[p]['pid'];
							for(i=1;i<=itemsCount-1;i++){
								var currrent_item_id = nlapiGetLineItemValue('item','custcol_ava_item',i);
								var currrent_item_qty = nlapiGetLineItemValue('item','quantity',i);
								 if(currrent_item_id.trim() == promo_pid.trim()){
									//final_promo_price = promo_price*currrent_item_qty;
									nlapiSetLineItemValue('item','custcol_order_level_discount',i,promo_price);
									nlapiLogExecution('DEBUG','Promo Page Load: promo_Price',promo_pid.trim()+"=="+promo_price+"--"+i)									
								} 
							}
						}
						//var source = nlapiGetFieldValue('source')?nlapiGetFieldValue('source'):'';
						var orderId = nlapiGetFieldValue('tranid');
						var orderLetter = orderId.charAt(0);
						var orderLetter1 = orderId.charAt(1);
						nlapiLogExecution('DEBUG','Promo Page Load: orderLetter',orderLetter)
						var stageordercheck = orderLetter+orderLetter1;
						if(orderLetter == 'L' || orderLetter == 'Y' || stageordercheck == 'ST'){
							nlapiSetFieldValue('custbody_promo_spilt','T');
						}
					}
				}
			}
			
		}catch(e)
		{
			nlapiLogExecution('error','Promo error',e.message);
		}
	} */
}


//Naga added this code for INTNS-2550 (This will trigger on cashsale page load time only)
function promotionsOnCashsaleLoad(){
    var rectype = nlapiGetRecordType();	
	var recid = nlapiGetRecordId() > 0 ? nlapiGetRecordId() : '0';	
	var currrent_item_id = 0;
	var currrent_item_qty = 0;
	var custcol_order_level_discount = 0;
	var order_level_final_discount = 0;
	var tax = 0;
	var csubtotal = 0;
	var price = 0;
	var Ship_country = nlapiGetFieldValue('shipcountry');
//	nlapiLogExecution('AUDIT', 'Naga Return Page rectype', rectype); // Dinesh
	//var so_ord_discount = 0;
	

			
	if(rectype == 'cashsale' || rectype == 'invoice'){
		try
		{
			var itemsCount = nlapiGetLineItemCount('item');	
			if(itemsCount>0){
				//Naga added this for INTNS-2718
				var custbody_duties = nlapiGetFieldValue('custbody_duties');
				if(custbody_duties != null && custbody_duties != "" && custbody_duties != undefined && custbody_duties != 'NaN' && custbody_duties >0){
					itemsCount = itemsCount-1;
				}
				//end
			//	nlapiLogExecution('AUDIT', 'Naga promotionsOnCashsaleLoad', type) // Dinesh
			//	nlapiLogExecution('AUDIT', 'Naga CS itemsCount', itemsCount) // Dinesh
				var custcol_promo_details = nlapiGetLineItemValue('item','custcol_promo_details',itemsCount);
				if(custcol_promo_details != null){
					var jdata = JSON.stringify(custcol_promo_details);
					var promotionData = JSON.parse(custcol_promo_details)					
					var sdetails = promotionData.details;
					if (sdetails != null && sdetails !=undefined) {
						slength = sdetails.length;     
					}
					if(promotionData.ptype == 'orderlevel'){
						nlapiRemoveLineItem('item',itemsCount)
					//	nlapiLogExecution('AUDIT','CS Remove Item',itemsCount) // Dinesh
					}
				}
				
				for(i=1;i<=itemsCount;i++){
					custcol_order_level_discount = nlapiGetLineItemValue('item','custcol_order_level_discount',i);
					currrent_item_qty = nlapiGetLineItemValue('item','quantity',i);
					if(custcol_order_level_discount != null){
						order_level_final_discount += custcol_order_level_discount*currrent_item_qty;
					}
					price = nlapiGetLineItemValue('item','amount',i);
					if(price != '' && price != null){
				//	nlapiLogExecution('AUDIT','CS Promo IPrice',price) // Dinesh
					csubtotal +=parseFloat(nlapiGetLineItemValue('item','amount',i));		
					}					
				}				
				nlapiSetFieldValue('discountitem','59487');
				if(order_level_final_discount>0){
					tax = nlapiGetFieldValue('taxrate');
					if(tax>0 && Ship_country != 'CA'){
			//		nlapiLogExecution('AUDIT','CS Promo tax',tax)  // Dinesh
						var subtotal = nlapiGetFieldValue('subtotal');
				//		nlapiLogExecution('AUDIT','CS Promo subtotal',csubtotal) // Dinesh
						csubtotal = csubtotal-order_level_final_discount;
						csubtotal =  parseFloat(csubtotal).toFixed(2)
						var final_tax = (csubtotal*tax)/100;
						final_tax = parseFloat(final_tax).toFixed(2);						
				//		nlapiLogExecution('AUDIT','CS Promo final_tax',final_tax) // Dinesh
						nlapiSetFieldValue('taxamountoverride', final_tax);
					}
					
					if((rectype == 'cashsale' || rectype == 'invoice') && order_level_final_discount>0){
						nlapiSetFieldValue('discountrate',"-"+order_level_final_discount);
					//	nlapiLogExecution('AUDIT','CS Promo Page Load: promo_Price',"-"+order_level_final_discount) // Dinesh
					}
				}else if(nlapiGetFieldValue('discountrate') != null){
					//For Phone order orderlevel discount
					var discountRate = nlapiGetFieldValue('discountrate');
			//		nlapiLogExecution('AUDIT','CS discountRate0',discountRate)  // Dinesh
					if(discountRate.indexOf("%") !== -1){
					//	nlapiLogExecution('AUDIT','CS discountRate1',discountRate) // Dinesh
						discountRate = discountRate.replace("%","");
				//		nlapiLogExecution('AUDIT','CS discountRate2',discountRate) // Dinesh
						discountRate = discountRate.replace("-","");
				//		nlapiLogExecution('AUDIT','CS discountRate3',discountRate) // Dinesh
						discountRate = (csubtotal*discountRate)/100;	
				//		nlapiLogExecution('AUDIT','CS discountRate3',discountRate)	 // Dinesh
						csubtotal = csubtotal-parseFloat(discountRate).toFixed(2);
					}else{
						csubtotal = csubtotal-discountRate;
					//	nlapiLogExecution('AUDIT','CS csubtotal',csubtotal) // Dinesh
					}
					
					tax = nlapiGetFieldValue('taxrate');
					if(tax>0 && tax != null && Ship_country != 'CA'){
						var final_tax = (csubtotal*tax)/100;
						final_tax = parseFloat(final_tax).toFixed(2);
					//	nlapiLogExecution('AUDIT','CS Promo SO_tax',final_tax) // Dinesh
						nlapiSetFieldValue('taxamountoverride', final_tax);
					}					
				}
				
			}
			
		}catch(e)
		{
			nlapiLogExecution('error','Promo error',e.message);
		}
	}
}

//INTNS-2984

/*
function getItemPromotionPrice(linenumber,itemsCount,srec){ 
	var rectype = nlapiGetRecordType();	 
	var final_price = 0;
	var p_count = parseInt(0);
	for(ij=1;ij<=itemsCount;ij++){ 
		if(ij>linenumber){
			var amount = srec.getLineItemValue('item','amount',ij)
			if(amount>0){
				p_count++;
			}  
			if(amount<0 && p_count == 0){
				amount = Math.abs(amount);
				final_price +=parseFloat(amount); 
			} 
		}	 
	}  
	if(final_price > 0 && final_price!="" && final_price != 'NaN'){ 
		 return final_price;
	}else{ 
		return '0';
	}	
}

function getPgItemPromotionPrice(linenumber,itemsCount,srec){ 
	var rectype = nlapiGetRecordType();	 
	var final_price = 0;
	var p_count = parseInt(0);
	var endGroupAmount = parseFloat(0); 
	var discount = parseFloat(0); 
	if(srec.getFieldValue('discountrate')!="" && srec.getFieldValue('discountrate') != null){
		var disc = srec.getFieldValue('discountrate').replace('%',"");
		if(srec.getFieldValue('discountrate').indexOf('%') !== -1 && disc<0){ 
			discount = parseFloat(disc);
		}
	}		
					
	for(ij=1;ij<=itemsCount;ij++){
		var item_type= srec.getLineItemValue('item','itemtype',ij)
		var ingroup = srec.getLineItemValue('item','ingroup',ij) 
		if(ij>linenumber && ingroup!= 'T' && item_type != 'EndGroup'){
			ij+1; 
			var amount = srec.getLineItemValue('item','amount',ij);
			//nlapiLogExecution('AUDIT','Sravani 1551',p_count+'=='+ij+'=='+amount)
			if((amount>0 && typeof amount != undefined) || amount == null){
				//nlapiLogExecution('AUDIT','Sravani 1553',p_count+'=='+ij+'=='+amount)
				p_count++;
			}  
			if(amount<0 && p_count == 0 && typeof amount != undefined){
				amount = Math.abs(amount);
				final_price +=parseFloat(amount);
			} 
		}


	}
	var endgroup_check = 0;
	for(z=1;z<=itemsCount;z++){
		var item_type= srec.getLineItemValue('item','itemtype',z)		
		//nlapiLogExecution('AUDIT','Sravani 1559',p_count+'=='+z+'=='+final_price+'=='+linenumber+'=='+item_type)
		if((item_type == 'EndGroup' && z>linenumber) && ((final_price == 0) ||  final_price > 0) && endgroup_check==0){
			
			endGroupAmount = srec.getLineItemValue('item','amount',z);
			//nlapiLogExecution('AUDIT','Sravani 1568',p_count+'=='+z+'=='+endGroupAmount+'=='+final_price)			
			//nlapiLogExecution('AUDIT','endGroupAmount 1563',p_count+'=='+z+'=='+endGroupAmount+'=='+final_price)
			endgroup_check = 1;
			
		}	
	}
	if((final_price > 0 && final_price!="" && final_price != 'NaN') || endGroupAmount>0){
		endGroupAmount = parseFloat(endGroupAmount)-parseFloat(final_price);
      	//nlapiLogExecution('AUDIT','endGroupAmount 1564',endGroupAmount)
		if(discount<0){
			discount = ((parseFloat(endGroupAmount)*parseFloat(discount))/100); 
			endGroupAmount = (parseFloat(endGroupAmount)+parseFloat(discount)).toFixed(2); 
		} 
		return endGroupAmount;
	}else{
		return '0';
	}	
}
*/
 
 //INTNS-2984 END
 
//Naga added this code for INTNS-2550 (This will trigger on Return Auther page. if order level data is there then this will remove that item)
function promotionsOnReturnPageLoadJson(){
    var rectype = nlapiGetRecordType();	
	var recid = nlapiGetRecordId() > 0 ? nlapiGetRecordId() : '0';	
	var currrent_item_id = 0;
	var currrent_item_qty = 0;
	var custcol_order_level_discount = 0;
	var order_level_final_discount = 0;
	nlapiLogExecution('debug', 'Naga RO rectype', rectype)
	if(rectype == 'returnauthorization'){
		try
		{
			var itemsCount = nlapiGetLineItemCount('item');	
			nlapiLogExecution('debug', 'Naga RO itemsCount', itemsCount)
			if(itemsCount>0){
				nlapiLogExecution('debug', 'Naga promotions RO', type)				
				var custcol_promo_name = nlapiGetLineItemValue('item','custcol_order_level_discount',itemsCount)
				var custcol_promo_details = nlapiGetLineItemValue('item','custcol_promo_details',itemsCount);
				
				var custcol_promo_details = nlapiGetLineItemValue('item','custcol_promo_details',itemsCount);
				if(custcol_promo_details != null){
					var jdata = JSON.stringify(custcol_promo_details);
					var promotionData = JSON.parse(custcol_promo_details)					
					var sdetails = promotionData.details;
					if (sdetails != null && sdetails !=undefined) {
						slength = sdetails.length;     
					}
					if(promotionData.ptype == 'orderlevel'){
						nlapiRemoveLineItem('item',itemsCount)
						nlapiLogExecution('DEBUG','RO Remove Item',itemsCount)
					}
				}
			}
		}catch(e)
		{
			nlapiLogExecution('error','Promo RO error',e.message);
		}
	}
}


//Naga added this for INTNS-2568
function taxAmountUpdateFromWebsiteColumn(type){ 	
	//New script for tax issue Naga
	var rectype = nlapiGetRecordType();	
	try
	{	
	var Ship_country = nlapiGetFieldValue('shipcountry');	
	var Ship_country_so = nlapiGetFieldText('custbody102');
	var context = nlapiGetContext();
	var excutution_context = context.getExecutionContext(); 
//	nlapiLogExecution('audit', 'taxweb excutution_context', excutution_context)// Dinesh
	if(type == 'create' && rectype == 'returnauthorization' && excutution_context != 'userinterface' && (Ship_country != "CA" && Ship_country_so != 'Canada')){
		var taxweb = parseFloat(nlapiGetFieldValue('custbody_lr_tax_total_from_website'));
	//	nlapiLogExecution('audit', 'taxweb i', taxweb) // Dinesh
		nlapiSetFieldValue('discountitem','');
		if(taxweb!="" && taxweb!= null && taxweb >0 && taxweb != 'NaN'){
	//		nlapiLogExecution('audit', 'taxweb LR Updated', taxweb);   // Dinesh
			nlapiSetFieldValue('taxamountoverride',taxweb);
		}
	}
	}catch(e)
	{
		nlapiLogExecution('error','Refund Page Error',e.message);
	}
	
	if(rectype == 'cashrefund'){
		try
		{
			var createmfrom = nlapiGetFieldValue('createdfrom');
			var lrtax = nlapiGetFieldValue('custbody_lr_tax_total');
			var tax_amount_from_website = nlapiLookupField('returnauthorization',createmfrom,'custbody_lr_tax_total_from_website');
			if(tax_amount_from_website && tax_amount_from_website!= null && tax_amount_from_website != 0){
				//nlapiSetFieldValue('taxamountoverride',tax_amount_from_website);
			//	nlapiLogExecution('debug', 'tax_amount_from_website Refund', tax_amount_from_website) // Dinesh
			}else{
				//Naga added this for INTNS-2718. this will work for canada only
				var Ship_country = nlapiGetFieldValue('shipcountry');
				var custbody35 = nlapiGetFieldValue('custbody35');
				if(lrtax && lrtax!= null && lrtax != 0 && Ship_country == "CA"){
					//nlapiSetFieldValue('taxamountoverride',lrtax);	
				}else if(custbody35 && custbody35!= null && custbody35 != 0 && Ship_country == "CA"){
					//nlapiSetFieldValue('taxamountoverride',custbody35);					
				}
			}
		}catch(e)
		{
			nlapiLogExecution('error','Refund Page Error',e.message);
		}
	}
}


function sendContractJobEmailNotificationsNew(){
	var itemsCount = nlapiGetLineItemCount('item');
	var vendorId = '';
	var vendorInfo = '';
	var vendor_email = '';
	var custcol_always_notify = '';
	var item_id = '';
	var manufac_name = '';
	var qty = '';
	var item_amount = 0;
	var custcol_notify_over_10k = '';
	var jsonData = '[';
	var always_notify_count=0;
	var notify_over_10k_count=0;
	var t_manufac_name = '';
	var t_product_name = '';
	var t_qty = '';	
	var t_custcol_always_notify = '';
	var t_custcol_notify_over_10k = '';	
	var record = nlapiGetRecordType();
	var id = nlapiGetRecordId();
	var load = nlapiLoadRecord(record ,id);
	var tranid = load.getFieldValue('tranid');
	var obj = []; 
	for(i=1;i<=itemsCount;i++){
		vendorId = nlapiLookupField('item',nlapiGetLineItemValue('item','item',i),'vendor');
		vendorInfo = nlapiLoadRecord("vendor" ,vendorId)
		custcol_always_notify = vendorInfo.getFieldValue('custentity_always_register');
		custcol_notify_over_10k = vendorInfo.getFieldValue('custentity_notify_over_10k');
		vendor_email = vendorInfo.getFieldValue('custentity_job_registration_contact_emai');
		item_id = nlapiGetLineItemValue('item','custcol_product_id',i);
		manufac_name = nlapiGetLineItemValue('item','custcol_vendor',i);
		item_amount = nlapiGetLineItemValue('item','amount',i);
		item_amount = item_amount?item_amount:0;
		qty = nlapiGetLineItemValue('item','quantity',i);
		if(vendor_email != "" && vendor_email != null && (custcol_always_notify == 'T' || custcol_notify_over_10k == 'T')){
		//if(vendor_email != "" && vendor_email != null){
			always_notify_count++;
			//jsonData = jsonData + "{email:"+'"'+vendor_email+'"'+", manufac_name:"+'"'+manufac_name+'"'+", qty:"+'"'+qty+'"'+", custcol_always_notify:"+'"'+custcol_always_notify+'"'+", item_id:"+'"'+item_id+'"'+", item_amount:"+'"'+item_amount+'"'+"},";
			tmp = {
					'email': vendor_email,
					'manufac_name': manufac_name,
					'qty': qty,
					'custcol_always_notify': custcol_always_notify,
					'item_id': item_id,
					'item_amount': item_amount,
					'custcol_notify_over_10k' : custcol_notify_over_10k
				};
				obj.push(tmp);	
		}
	}
	//nlapiLogExecution('AUDIT','jsonData=Before',obj); // Dinesh
//	nlapiLogExecution('AUDIT','always_notify_count=',always_notify_count); // Dinesh
	if(always_notify_count>0){		
		var groupedemails = groupArrayOfObjects(obj,"email");
	//	nlapiLogExecution('AUDIT','jsonData=After',JSON.stringify(groupedemails)); // Dinesh
		var objkeys = Object.keys(groupedemails);
		for(i=0;i<objkeys.length;i++){
			var tbody = '';
			var tbody1 = '';
			var t_amount = 0;
			var firstEmail = 0;
			var secondEmail = 0;
			var email = objkeys[i];
			var emailarray = groupedemails[email];		
			for(j=0;j<emailarray.length;j++){
				t_manufac_name = groupedemails[email][j].manufac_name;
				t_product_name = groupedemails[email][j].item_id;
				t_qty = groupedemails[email][j].qty;
				t_custcol_always_notify = groupedemails[email][j].custcol_always_notify;				
				t_custcol_notify_over_10k = groupedemails[email][j].custcol_notify_over_10k;
					
				if(t_custcol_always_notify == 'T'){
					tbody += '<tr>';
					tbody += '<td style="text-align: center; height: 13px;">'+t_manufac_name+'</td>';
					tbody += '<td style="text-align: center; height: 13px;">'+t_product_name+'</td>';
					tbody += '<td style="text-align: center; height: 13px;">'+t_qty+'</td>';
					tbody += '</tr>';
					firstEmail++;
				}

				if(t_custcol_notify_over_10k == 'T'){
					t_amount += parseFloat(groupedemails[email][j].item_amount);
					
					tbody1 += '<tr>';
					tbody1 += '<td style="text-align: center; height: 13px;">'+t_manufac_name+'</td>';
					tbody1 += '<td style="text-align: center; height: 13px;">'+t_product_name+'</td>';
					tbody1 += '<td style="text-align: center; height: 13px;">'+t_qty+'</td>';
					tbody1 += '</tr>';
					secondEmail++;
				}
			}
		/* 	nlapiLogExecution('AUDIT','tbody='+email,tbody);
			nlapiLogExecution('AUDIT','tbody1='+email,tbody1);
			nlapiLogExecution('AUDIT','t_amount=',t_amount); */  // Dinesh
			if(t_amount>10000){
				sendJobEmailContent(email,tbody1, tranid);
			}
			if(firstEmail>0){
			//	nlapiLogExecution('DEBUG','EmailJob Email','First Email sent'); // Dinesh
				sendJobEmailContent(email,tbody, tranid);
			}
		}
	}
	
//	nlapiLogExecution('DEBUG','always_notify_count',always_notify_count) // Dinesh
}

function groupArrayOfObjects(list, key) {
  return list.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

//Not using this function. Remove this - Naga
function sendContractJobEmailNotifications(){
	var itemsCount = nlapiGetLineItemCount('item');	
//	nlapiLogExecution('DEBUG','EmailJob itemsCount',itemsCount)	 // Dinesh
	var custcol_job_registration_contact_email1 = '';
	var custcol_job_registration_contact_email2 = '';
	var vendorEmails = [];
	try{
	var record = nlapiGetRecordType()
	var id = nlapiGetRecordId()
	var load = nlapiLoadRecord(record ,id);
	var tranid = load.getFieldValue('tranid');
	
	for(i=1;i<=itemsCount;i++){
		var custcol_always_notify = '';
		var custcol_notify_over_10k = '';
		var tbody = '';
		var tbody1 = '';
		var firstEmail = 0;
		var secondEmail = 0;
		var vendorId1 = '';
		var vendorId = nlapiLookupField('item',nlapiGetLineItemValue('item','item',i),'vendor');
	//	nlapiLogExecution('DEBUG','EmailJob vendorId',vendorId); // Dinesh		
		var vendorInfo = nlapiLoadRecord("vendor" ,vendorId)
		custcol_job_registration_contact_email1 = vendorInfo.getFieldValue('custentity_job_registration_contact_emai');
	//	nlapiLogExecution('DEBUG','EmailJob custcol_job_registration_contact_email1',custcol_job_registration_contact_email1); // Dinesh
		if(custcol_job_registration_contact_email1 != "" && custcol_job_registration_contact_email1 != null && vendorEmails.indexOf(custcol_job_registration_contact_email1)<0){
		    for(j=1;j<=itemsCount;j++){				
				vendorId1 = nlapiLookupField('item',nlapiGetLineItemValue('item','item',j),'vendor');
				var vendorInfo1 = nlapiLoadRecord("vendor" ,vendorId1)
				custcol_job_registration_contact_email2 =  vendorInfo1.getFieldValue('custentity_job_registration_contact_emai');
				custcol_always_notify = vendorInfo1.getFieldValue('custentity_always_register');
				custcol_notify_over_10k = vendorInfo1.getFieldValue('custentity_notify_over_10k');
				/* nlapiLogExecution('DEBUG','EmailJob custcol_job_registration_contact_email2',custcol_job_registration_contact_email2);
				nlapiLogExecution('DEBUG','EmailJob custcol_always_notify',custcol_always_notify);
				nlapiLogExecution('DEBUG','EmailJob custcol_notify_over_10k',custcol_notify_over_10k); */  // Dinesh
				if(custcol_job_registration_contact_email2 != "" && custcol_job_registration_contact_email2 != null){					
					if(custcol_job_registration_contact_email1 == custcol_job_registration_contact_email2 && custcol_always_notify == 'T'){
						itemId = nlapiGetLineItemValue('item','item_display',j);						
						tbody += '<tr>';
						tbody += '<td style="text-align: center; height: 13px;">'+nlapiGetLineItemValue('item','custcol_vendor',j)+'</td>';
						tbody += '<td style="text-align: center; height: 13px;">'+nlapiGetLineItemValue('item','custcol_product_id',j)+'</td>';
						tbody += '<td style="text-align: center; height: 13px;">'+nlapiGetLineItemValue('item','quantity',j)+'</td>';
						tbody += '</tr>';
						firstEmail++;
					}
					
					if(custcol_job_registration_contact_email1 == custcol_job_registration_contact_email2 && custcol_notify_over_10k == 'T' && (nlapiGetLineItemValue('item','amount',j)>=10000) && nlapiGetLineItemValue('item','amount',j)!=null){
						itemId = nlapiGetLineItemValue('item','item_display',j);						
						tbody1 += '<tr>';
						tbody1 += '<td style="text-align: center; height: 13px;">'+nlapiGetLineItemValue('item','custcol_vendor',j)+'</td>';
						tbody1 += '<td style="text-align: center; height: 13px;">'+nlapiGetLineItemValue('item','custcol_product_id',j)+'</td>';
						tbody1 += '<td style="text-align: center; height: 13px;">'+nlapiGetLineItemValue('item','quantity',j)+'</td>';
						tbody1 += '</tr>';
						secondEmail++;
					}
				}
			} 
			
		//	nlapiLogExecution('DEBUG','EmailJob Emails Count',firstEmail+"=="+secondEmail); // Dinesh
			//nagarjuna.enumula@ydesigngroup.com
			vendorEmails.push(custcol_job_registration_contact_email1);	
			if(firstEmail>0){
			//	nlapiLogExecution('DEBUG','EmailJob Email','First Email sent'); // Dinesh
				sendJobEmailContent(custcol_job_registration_contact_email1,tbody, tranid);
			}
			
			if(secondEmail>0){
			//	nlapiLogExecution('DEBUG','EmailJob Email','Second Email sent'); // Dinesh
				sendJobEmailContent(custcol_job_registration_contact_email1,tbody1, tranid);
			}
			
			//nlapiSendEmail("18956886", 'nagarjuna.enumula@ydesigngroup.com', 'Test Email', 'Attaching record to transaction record', null, null, rec)
			//nlapiLogExecution('DEBUG','EmailJob Information',custcol_job_registration_contact_email1+"=="+custcol_always_notify)
		}		
	}
	
	}catch(e)
	{
		nlapiSendEmail("18956886", ["nagarjuna.enumula@ydesigngroup.com,ktunguturu@ydesigngroup.com,dgadham@ydesigngroup.com,kunal.kumar@ydesigngroup.com"], 'Proposal Contract email error' +tranid, e.message, null, null, null)
		nlapiLogExecution('error','Proposal Contract email error',e.message);
	}
	
}

function sendJobEmailContent(emailId,tbody,tranid){
	try{
	var rec = new Array();
	rec['transaction'] = nlapiGetRecordId();
	var customer_record = nlapiLoadRecord('customer',nlapiGetFieldValue('custbody_lum_indiv_customer'));
	var custentity_lum_cust_segment = customer_record.getFieldText('custentity_lum_cust_segment');
	
	var current = new Date();
	var day = current.getDate();
	var month = current.getMonth()+1;
	var year = current.getFullYear();
	var currentDate =  month+'/'+day+'/'+year;

	var body = '<style type="text/css">td {font-family:Verdana, Arial, Helvetica, sans-serif; font-size:12px;}</style>';
		body += '<table cellpadding="5" cellspacing="5" style="border-left: 1px solid rgb(129, 129, 129); border-top: 1px solid rgb(129, 129, 129); width: 652px;" width="600"><tbody><tr><td style="width: 630px;"><table cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align: center;" valign="middle"><img alt="YDesign Group" src="https://blog.lumens.com/email/bits/YDG_Contract_2019.png" width="350" /></td></tr></tbody></table>';
		body += '<table cellpadding="0" cellspacing="0" width="100%"><tbody><tr valign="bottom"><td align="left" class="orange_text_big"> </td><td align="right" class="grey_text_plain"><table cellpadding="0" cellspacing="0" width="250"><tbody><tr valign="top"><td align="right" class="grey_text_plain"> </td><td align="right" class="grey_text_plain"><span style="color:#000000;">Date: '+currentDate+'</span></td></tr></tbody></table></td></tr></tbody></table><p>Hello,<br /><br />';
		body += 'The '+custentity_lum_cust_segment +' Team has received a quote request for items from your product line. We are writing to inform your company of our potential involvement in this project. Please see the information below:<br /><br />';
		body += '• Job Name: '+nlapiGetFieldValue("custbody_project_name")+'<br />';
		body += '• Specifier: '+nlapiGetFieldValue("custbody_specifier")+'*<br />';
		body += '• Location: '+nlapiGetFieldValue("custbody_project_address")+'*<br />';
		body += '• Est. Date of install: '+nlapiGetFieldValue("custbody_install_date")+'<br /><br />';
		body += 'Please find your item(s) on the list below and reply to this email with any information that may pertain to the '+custentity_lum_cust_segment +' Teams potential involvement with this project, as well as any discounts, or freight allowance that you may be willing to extend.</p>';
		body += '<table border="1" cellpadding="1" cellspacing="1" style="width:630px;"><tbody><tr><td style="text-align: center;">Manufacturer Name</td><td style="text-align: center;">Product I.D. </td><td style="text-align: center;">QTY</td></tr>';
		body += tbody;
		body += '</tbody></table>';
		body += '<p>We look forward to your response.</p><p>Thank you,</p>';
		body += '<p><br /><br />*Specifier + Location is based on customer feedback, and may not be accurate.</p>';
		body += '<p style="text-align: center;"><span style="font-size:8px;">To ensure you receive our order specific e-mails in your inbox (not sent to bulk or junk folders), please add <a href="mailto:contract@ydesigngroup.com">contract@ydesigngroup.com</a>.</span></p><p><br /></p></td></tr></tbody></table>';
		nlapiLogExecution('DEBUG','EmailJob Before Sent Email','Before Email sent');
		//nlapiSendEmail("18956886", emailId, 'Vendor Job Notification from the YDesign Group ' +nlapiGetFieldValue('tranid'), body, null, null, rec)
		nlapiSendEmail("20009253", emailId, 'Vendor Job Notification from the YDesign Group - ' +tranid, body, null, null, rec)
		nlapiLogExecution('DEBUG','EmailJob After Sent Email','After Email sent='+nlapiGetRecordId()+"=="+nlapiGetFieldValue('tranid'));
	}catch(e)
	{
		nlapiSendEmail("18956886", ["nagarjuna.enumula@ydesigngroup.com,ktunguturu@ydesigngroup.com,dgadham@ydesigngroup.com,kunal.kumar@ydesigngroup.com"], 'Proposal Contract email error' +tranid, e.message, null, null, null)
		nlapiLogExecution('error','Proposal Contract email error',e.message);
	}
}


function updateTaxExemptStatus(){ 
	try{
		var headers = new Array();	
		var entityid = nlapiGetFieldValue("entityid"); //'Y11621054'
		var brand = nlapiGetFieldValue("custentity_cseg_ilt_busns_unit");
		var api_endpoint = "https://api.certcapture.com/v2/customers/"+entityid+"/active-certificates";
		headers['Content-Type'] = 'application/json'
		headers['x-client-id'] = '66340' //Lumens
		nlapiLogExecution('debug', 'brand', brand)
		if(brand == 1){
			headers['x-client-id'] = '66339' //YL
		}	
		headers['x-customer-primary-key'] = 'customer_number'
		headers['Authorization'] = 'Basic ZGJoYXR0YWNoYXJqZWVAeWRlc2lnbmdyb3VwLmNvbToyMDIxbGlnaHRTMSE='; 
		var resp = nlapiRequestURL(api_endpoint,null,headers,'GET')
		nlapiLogExecution('debug', 'Pageload US: Response Code', resp.code)
		var respBody = resp.getBody()
		
		var stringdata =  JSON.stringify(resp.getBody());
		var parseResponse = JSON.parse(respBody);  
		var obj = JSON.parse(respBody);
		nlapiLogExecution('audit', 'objCount', obj.length)
		if(resp.code === 404){
			nlapiLogExecution("DEBUG","success",obj.success);
			nlapiLogExecution("DEBUG","error",obj.error);
		}else{
			var state_ids = [];
			for(i=0;i<obj.length;i++){
				state_ids.push(obj[i].exposure_zone.state.initials);
				nlapiLogExecution("DEBUG","In Loop obj.exposure_zone.state",obj[i].exposure_zone.state.initials);
			}
			//nlapiLogExecution("DEBUG","Response body",respBody);
			//nlapiLogExecution("DEBUG","Respbody",typeof(respBody));
			nlapiSetFieldValue('custentity_tax_exempt_state',state_ids.join())
			nlapiLogExecution("DEBUG","obj.state",state_ids.join()); 
		} 
	}catch(e)
	{
		nlapiLogExecution('error','updateTaxExemptStatus error',e.message);
	}
}

function updateCallTagValue(){
	try{
		var itemsCount = nlapiGetLineItemCount('item');
		var tagflag=0;
		for(i=1;i<=itemsCount;i++){
			var itemtype = nlapiGetLineItemValue("item","itemtype",i)
			if(itemtype == 'InvtPart'){
				var custitem_vendor = nlapiLookupField('inventoryitem',nlapiGetLineItemValue('item','item',i),'custitem_vendor_how_returns_handled');
				if(custitem_vendor && (custitem_vendor == 'RTL' || custitem_vendor == 'RTV')){ 
					tagflag++;
				}
			}
		}
		if(tagflag>0){
			nlapiSetFieldValue("custbody_issue_call_tags",'T');
		}
	}catch(e)
	{
		nlapiLogExecution('error','updateCallTagValue error',e.message);
	}
}

function updateProposalTaxForExemptCustomer(rec){
	try{
		var exempt_states = '';
		var customer_id = rec.getFieldValue("custbody_lum_indiv_customer");
		nlapiLogExecution('audit','before customer_id',customer_id);
		if(customer_id=="" || customer_id == null){
			nlapiLogExecution('audit','inside cid',customer_id);
			customer_id = rec.getFieldValue("entity");
		}
		
		//API Call
		var headers = new Array();	
		var entityid = nlapiLookupField('customer', customer_id, 'entityid') //'Y11621054'
		var brand = nlapiLookupField('customer', customer_id, 'custentity_cseg_ilt_busns_unit');
		var api_endpoint = "https://api.certcapture.com/v2/customers/"+entityid+"/active-certificates";
		headers['Content-Type'] = 'application/json'
		headers['x-client-id'] = '66340' //Lumens
		nlapiLogExecution('debug', 'brand', brand)
		if(brand == 1){
			headers['x-client-id'] = '66339' //YL
		}	
		headers['x-customer-primary-key'] = 'customer_number'
		headers['Authorization'] = 'Basic Y2VydGNhcHR1cmVAeWRlc2lnbmdyb3VwLmNvbTpBRWs4SjUmNyE='; 
		var resp = nlapiRequestURL(api_endpoint,null,headers,'GET')
		//nlapiLogExecution('debug', 'Pageload US: Response Code', resp.code)
		var respBody = resp.getBody()
		
		var stringdata =  JSON.stringify(resp.getBody());
		var parseResponse = JSON.parse(respBody);  
		var obj = JSON.parse(respBody);
		nlapiLogExecution('audit', 'objCount', obj.length)
		if(resp.code === 404){
			nlapiLogExecution("DEBUG","success",obj.success);
			nlapiLogExecution("DEBUG","error",obj.error);
		}else{
			var state_ids = [];
			for(i=0;i<obj.length;i++){
				state_ids.push(obj[i].exposure_zone.state.initials);
				nlapiLogExecution("DEBUG","In Loop obj.exposure_zone.state",obj[i].exposure_zone.state.initials);
			}
			//nlapiLogExecution("DEBUG","Response body",respBody);
			//nlapiLogExecution("DEBUG","Respbody",typeof(respBody));
			nlapiSetFieldValue('custentity_tax_exempt_state',state_ids.join())
			nlapiLogExecution("DEBUG","obj.state",state_ids.join()); 
			exempt_states = state_ids.join()
		}
		
		//API call end 
		nlapiLogExecution('audit','exempt_states',exempt_states);
		var ship_state = rec.getFieldValue('shipstate')
		nlapiLogExecution('audit','ship_state',ship_state);
		nlapiLogExecution('audit',exempt_states,exempt_states.indexOf(ship_state));
		if(exempt_states && exempt_states.indexOf(ship_state) != -1){
			nlapiLogExecution('audit','Proposal/SO tax updated to zero',"after if");
			rec.setFieldValue('taxamountoverride', 0);
			var submitrec = nlapiSubmitRecord(rec, true, false);
			nlapiLogExecution('audit','Proposal/SO tax updated to zero',"Success submitrec"+submitrec);
		}
	}catch(e)
	{
		nlapiLogExecution('error','Proposal tax update error',e.message);
	}
}