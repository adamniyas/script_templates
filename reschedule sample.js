/**
 * * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
/**
 * Script Description: This script is used to create Package and Package content Record from JSON data
 * got from fulfillment record.
 * This script is scheduled from a work flow in on create.
 * converting the JSON field to package and package contents records 
 *
 */
/*******************************************************************************
 * * Ship Junction * *
 * **************************************************************************
 * Date: 25/6/18 created Script name:SJ SS Json to Package Script id:
 * customscript_sj_ss_json_to_package Deployment id:
 * customdeploy_sj_ss_json_to_package Triggered By : 
        1.SJ WA Json to Package
        2.SjSSJsonToPackageProcessItemShipments
        3.SJ SS Json to Package(rescheduling)
 * 
 * parameters : custscript_itemfulfillmentid (Id of item fulfillment)
 * 				custscript_jj_shjn11_startindex:(first index of package details to be processed
 * 
 ******************************************************************************/

define(
		[ 'N/http', 'N/record', 'N/runtime', 'N/search', 'N/format', "N/file" ,'N/task'],

		function(http, record, runtime, search, format, file,task) {

			function execute(scriptContext) {
				try {

					// receive the parameter item fulfillment ID

					var itemFulfillmentId = runtime.getCurrentScript()
							.getParameter("custscript_itemfulfillmentid");
					var start = runtime.getCurrentScript()
					.getParameter("custscript_jj_shjn11_startindex");
					logme("Updated record ID", itemFulfillmentId);
					logme("start", start);

					// Check item fulfillment ID is valid
					if (itemFulfillmentId != null && itemFulfillmentId != ""
							&& itemFulfillmentId != undefined) {
						// load item fulfillment record with item fulfillment ID
						var fullfillmentRecord = record.load({
							type : "itemfulfillment",
							id : itemFulfillmentId,
							isDynamic : true
						});

						// Get JSON field value and parse
						var jsonDatas = fullfillmentRecord.getValue({
							fieldId : 'custbody_sj_itemf_package_json'
						});
						parsedJsonDatas = JSON.parse(jsonDatas);
						//set flag for last schedule
						var isEnd=true;
						// for every array in JSON
						for (var i = start; i < parsedJsonDatas.length; i++) {
							// load array member with index i
							jsonDatas = parsedJsonDatas[i];
							// get tracking number from array
							var trackingNumber = jsonDatas.TrackingNumber;

							// Check whether there is record with tracking
							// number
							var packageSearchResult = packageSearchWithTrackno(
									trackingNumber, itemFulfillmentId);

							// search status is create New
							if (packageSearchResult == 'createNew') {
								// create package record
								var createdPackageRecordResult = createPackageRecord(
										jsonDatas, packageSearchResult,
										itemFulfillmentId);

								if (createdPackageRecordResult != '') {
									// create package content record
									var createdPackageContentRecordResult = createPackageContentRecord(
											jsonDatas, itemFulfillmentId,
											createdPackageRecordResult);

								}
							}
							
							
							
							var scriptObj = runtime.getCurrentScript();
							var remainingTime=scriptObj.getRemainingUsage();
							log.debug("Remaining governance units: " + remainingTime);
							
							
							//Check the remaining usage is too low 
							if(remainingTime<1000)
								{
								
							 	//reschedule Schedule script 
							 	scheduleScrptTask=task.create({
							 		taskType:task.TaskType.SCHEDULED_SCRIPT,
							 		scriptId:"customscript_sj_ss_json_to_package",
							 		deploymentId:'customdeploy_sj_ss_json_to_package',
							 		params:{
							 			custscript_itemfulfillmentid:itemFulfillmentId,
							 			custscript_jj_shjn11_startindex:i+1
							 			}
							 	});
							 	//set flag not the end of data.
							 	isEnd=false;
							 	logme("scheduleScrptTask",scheduleScrptTask);
							 	var scriptTaskId = scheduleScrptTask.submit();
							 	
							 	//break the loop
							 	break;
							 	
								}
							
							
							
							
							
						}
						//if the script is ending script set 
						if (createdPackageContentRecordResult != ''
								&& jsonDatas.ShouldCreateAsn == true && isEnd==true) {

							// get current date
							var dt = (new Date()).toJSON();
							var dt = dt.split('.')[0];

							log.debug({
								title : "dt",
								details : dt
							});
							var asndate = parseDateString(dt);

							log.debug({
								title : "asndate",
								details : asndate
							});

							log.debug({
								title : "jsonDatas.ShouldCreateAsn",
								details : jsonDatas.ShouldCreateAsn
							});

							try {
								fullfillmentRecord.setValue({
									fieldId : 'custbody_sj_item_ful_asn_ready',
									value : jsonDatas.ShouldCreateAsn,
									ignoreFieldChange : true
								});
							} catch (err) {
								logme("ERROR_true", err);
							}
							// set date in item fulfillment record
							fullfillmentRecord.setValue({
								fieldId : 'custbody_sj_itemful_asn_ready_date',
								value : asndate,
								ignoreFieldChange : true
							});
                            //Enqueue from processin queue
                            fullfillmentRecord.setValue({
								fieldId : 'custbody_sj_is_package_to_be_created',
								value : false,
								ignoreFieldChange : true
							});
							// save item fulfillment record
							var recordId = fullfillmentRecord.save({
								enableSourcing : true,
								ignoreMandatoryFields : true
							});
							log.debug({
								title : "recordId",
								details : recordId
							});
                            
                            
                         //Schedule for the next itemshipment  
                            
                            
                            
                            
                             executeNext()
                            
                            log.debug({
						details : scriptTaskId,
						title : "END_NEXT"
					});

						}
					} 

				} catch (err) {
					log.debug({
						details : err,
						title : "Error@main"
					});
				}
			}
			return {
				execute : execute
			};

            
            
            
            
            function executeNext()
    {
        
        
        
var itemfulfillmentSearchObj = search.create({
   type: "itemfulfillment",
   filters:
   [
      ["type","anyof","ItemShip"], 
      "AND", 
      ["custbody_sj_is_package_to_be_created","is","T"]
   ],
   columns:
   [
      search.createColumn({
         name: "internalid",
         summary: "GROUP",
         sort: search.Sort.ASC,
         label: "Internal ID"
      })
   ]
});
        
        
        var results = itemfulfillmentSearchObj.run().getRange({start :0,end :1});
       
        
        //if shipments available
       if(results.length>0)
           {
              var shipmentId=results[0].getValue({
         name: "internalid",
         summary: "GROUP",
         sort: search.Sort.ASC,
         label: "Internal ID"
      });
                log.debug({title:"shipmentId",details:shipmentId});
               
                    //Schedule tasks
               try{
                    var scheduleScrptTask=task.create({
							 		taskType:task.TaskType.SCHEDULED_SCRIPT,
							 		scriptId      :"customscript_sj_ss_json_to_package",
							 		deploymentId  :'customdeploy_sj_ss_json_to_package',
							 		params:{
							 			custscript_itemfulfillmentid:shipmentId,
							 			custscript_jj_shjn11_startindex:0
							 			}
							 	});
               
                   var scriptTaskId = scheduleScrptTask.submit(); 
               }
               catch(err)
                   {
               log.debug({title:"Not_Trigerred",details:"Scheduled Already"});        
                   }
           }
        else log.debug({title:"NO_shipmentId",details:"NO_shipmentId"});
        
 
        
    }
			function packageSearchWithTrackno(trackingNumber) {
				try {

					// create search for searching package record with same
					// tracking number
					var mySearch = search.create({
						type : 'customrecord_sj_package',
						title : 'Package Search With Tracking Number(JJ)',
						columns : [ 'internalid',
								'custrecord_sj_pkg_tracking_number' ]
					});
					// add filter for package to know whether there is existing
					// package record
					var filters1 = mySearch.filters;
					var filterss1 = {};
					filterss1.name = 'custrecord_sj_pkg_tracking_number';
					filterss1.operator = 'IS';
					filterss1.values = trackingNumber;
					filters1.push(search.createFilter(filterss1));

					mySearch.filters = filters1;
					// run the search
					var result = mySearch.run().getRange({
						start : 0,
						end : 10
					});

					if (result.length <= 0) {
						return 'createNew';
					} else {
						var inId = result[0].getValue({
							name : 'internalid'
						});

						return inId;
					}

				} catch (err) {
					logme("ERROR", err);
				}
			}

			function createPackageRecord(jsonDatas, searchResult,
					itemFulfillmentId) {
				try {

					// when an item fulfillment record is there
					// with current tracking number,
					// create package record and package
					// content record
					var packageIFRecord;
					if (searchResult == 'createNew') {
						packageIFRecord = record.create({
							type : 'customrecord_sj_package',
							isDynamic : false,
						});

					}

					// To set tracking number in package record
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_tracking_number',
						value : jsonDatas.TrackingNumber,
						ignoreFieldChange : false
					});

					// To set IsReturn number in package record
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_is_return',
						value : jsonDatas.IsReturn,
						ignoreFieldChange : false
					});

					// To set Weight in package record
					var pWeight = decimalFunction(jsonDatas.Weight);
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_weight',
						value : pWeight,
						ignoreFieldChange : false
					});

					// To set length in package record
					var pLength = decimalFunction(jsonDatas.Length);
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_length',
						value : pLength,
						ignoreFieldChange : false
					});

					// To set width in package record
					var pWidth = decimalFunction(jsonDatas.Width);
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_width',
						value : pWidth,
						ignoreFieldChange : false
					});

					// To set height in package record
					var pheight = decimalFunction(jsonDatas.Height);
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_height',
						value : pheight,
						ignoreFieldChange : false
					});

					// To set cost field
					var pcost = decimalFunction(jsonDatas.Cost);
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_cost',
						value : pcost,
						ignoreFieldChange : false
					});

					// To set Shipping service field
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_service_name',
						value : jsonDatas.ShippingMethod,
						ignoreFieldChange : false
					});

					// To set Shipping service field
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_po_number',
						value : jsonDatas.PoNumber,
						ignoreFieldChange : false
					});

					// To set reference 1 field
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_reference_1',
						value : jsonDatas.Reference1,
						ignoreFieldChange : false
					});

					// To set reference 2 field
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_reference_2',
						value : jsonDatas.Reference2,
						ignoreFieldChange : false
					});

					// To set shipping account number field
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_shipping_ac',
						value : jsonDatas.ShippingAccountNumber,
						ignoreFieldChange : false
					});

					// To set third part billing field
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_third_party_billing',
						value : jsonDatas.IsThirdPartyBilling,
						ignoreFieldChange : false
					});

					// To set Ucc field
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_ucc',
						value : jsonDatas.Ucc,
						ignoreFieldChange : false
					});

					// To set Sales Order in Package
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_sales_order',
						value : jsonDatas.SalesOrderInternalId,
						ignoreFieldChange : false
					});

					/* To set the pickedUP date */
					var pickedUpOn = parseDateString(jsonDatas.PickedUpDate);
					log.debug({
						title : 'pickedUpOn',
						details : pickedUpOn
					});
					if (pickedUpOn > new Date(1, 1, 1901)) {
						packageIFRecord.setValue({
							fieldId : 'custrecord_sj_pkg_picked_up_date',
							value : pickedUpOn,
							ignoreFieldChange : false
						});
					}

					/* To set the shipped date */

					var shippedDate = parseDateString(jsonDatas.ShippedDate);
					if (shippedDate > new Date(1, 1, 1901)) {
						packageIFRecord.setValue({
							fieldId : 'custrecord_sj_pkg_shipped_date',
							value : shippedDate,
							ignoreFieldChange : false
						});
					}

					/* To set the package type */
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_package_type',
						value : jsonDatas.PackageType,
						ignoreFieldChange : false
					});

					// To set item fulfillment Id in package
					// record
					packageIFRecord.setValue({
						fieldId : 'custrecord_sj_pkg_item_fulfillment',
						value : itemFulfillmentId,
						ignoreFieldChange : false
					});

					/* End of set the pickedUP date */
					/* To set the Delivered date */

					var deliveredOn = parseDateString(jsonDatas.DeliveredOnDate);
					if (deliveredOn > new Date(1, 1, 1901)) {
						packageIFRecord.setValue({
							fieldId : 'custrecord_sj_pkg_delivered_date',
							value : deliveredOn,
							ignoreFieldChange : false
						});
					}

					/* End of set the Delivered date */
					var packageIFRecordId = packageIFRecord.save({
						enableSourcing : true,
						ignoreMandatoryFields : true
					});

					if (packageIFRecordId != '') {
						return packageIFRecordId;
					}

				} catch (err) {

					logme("ERROR", err);

				}
			}

			function createPackageContentRecord(jsonDatas, itemfulfilmentId,
					packageRecordId) {
				try {
					lineItems = jsonDatas.Lineitems;

					for (var i = 0; i < lineItems.length; i++) {

						// create a package content record
						packageContentRecord = record.create({
							type : 'customrecord_sj_package_content',
							isDynamic : false,
						});
						// set value for item fulfillment field
						packageContentRecord.setValue({
							fieldId : 'custrecord_sj_pkg_cnt_itemfulfillment',
							value : itemfulfilmentId,
							ignoreFieldChange : false
						});

						// set value for package field
						packageContentRecord.setValue({
							fieldId : 'custrecord_sj_pkg_cnt_package',
							value : packageRecordId,
							ignoreFieldChange : false
						});

						// set value for item field

						packageContentRecord.setValue({
							fieldId : 'custrecord_sj_pkg_cnt_item',
							value : lineItems[i].ItemId,
							ignoreFieldChange : false
						});

						// set value for quantity
						packageContentRecord.setValue({
							fieldId : 'custrecord_sj_pkg_cnt_quantity',
							value : lineItems[i].Quantity,
							ignoreFieldChange : false
						});

						// set value for Line Number
						packageContentRecord.setValue({
							fieldId : 'custrecord_sj_pkg_cnt_item_line_number',
							value : lineItems[i].LineNumber,
							ignoreFieldChange : false
						});

						// set value for Rate
						packageContentRecord.setValue({
							fieldId : 'custrecord_sj_pkg_cnt_pkg_rate',
							value : lineItems[i].Rate,
							ignoreFieldChange : false
						});

						// set value for PO Line Number
						if (lineItems[i].PoLineNumber > 0) {
							packageContentRecord
									.setValue({
										fieldId : 'custrecord_sj_pkg_cnt_pkg_po_ln_num',
										value : lineItems[i].PoLineNumber,
										ignoreFieldChange : false
									});
						}

						// save the record
						var packageContentRecordId = packageContentRecord
								.save({
									enableSourcing : true,
									ignoreMandatoryFields : true
								});

					}

					return packageContentRecordId;

				} catch (err) {

					logme("ERROR", err);

				}
			}
			function parseDateString(ds) {

				if (ds != null) {

					var a = ds.split('T'); // break date from time
					log.debug({
						title : 'a',
						details : a
					});
					var d = a[0].split('-'); // break date into year, month
					// day
					var t = a[1].split(':'); // break time into hours,
					// minutes,
					// seconds
					log.debug({
						title : 't',
						details : t
					});
					return new Date(d[0], d[1] - 1, d[2], t[0], t[1], t[2]);
				}
			}
			/* End of format date to set in datetime fields */
			/* Decimal function */
			function decimalFunction(num) {
				try {
					// To change the srting to decimal number
					num = parseFloat(num);
					var result = num.toFixed(2);
					return result;
				} catch (e) {
					log.debug({
						title : 'decimalFunction',
						details : e.message
					});

				}
			}

			/*******************************************************************
			 * return error
			 * 
			 * @param e
			 * @returns
			 * 
			 * Created on 09-Aug-2017 by rosemol
			 */
			function getError(e) {
				var stErrMsg = '';
				if (e.getDetails != undefined) {
					stErrMsg = '_' + e.getCode() + '<br>' + e.getDetails()
							+ '<br>' + e.getStackTrace();
				} else {
					stErrMsg = '_' + e.toString();
				}
				return stErrMsg;
			}

			/*******************************************************************
			 * Log these data
			 * 
			 * @param title
			 * @param details
			 * @returns
			 * 
			 * Created on 09-Aug-2017 by rosemol
			 */
			function logme(title, details) {
				log.debug({
					title : title,
					details : details
				});
			}

		});
