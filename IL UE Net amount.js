/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/ui/serverWidget','N/search'],

function(record,serverWidget,search) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
   /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
        log.debug("entry");
 var recId=scriptContext.newRecord.id;
 var transactionSearchObj = search.create({
   type: "transaction",
   filters:
   [
   ["internalid","anyof",recId], 'AND',
      ["item.type","noneof","Discount"], 'AND',
      ["mainline","is","F"],'AND',
      ["taxline","is","F"],'AND',
      ["cogs","is","F"],'AND',
      ["shipping","is","F"]
   ],
   columns:
   [
      search.createColumn({name: "internalid", label: "Internal ID"}),
      search.createColumn({name: "item", label: "Item"}),
      search.createColumn({name: "netamount", label: "Amount (Net)"}),
      search.createColumn({name: "line", label: "Line ID"}),
    search.createColumn({name: "type", label: "item type",join:"item"}),
    search.createColumn({name: "custcol_cancel_qty", label: "Cancel Qty"}),
      search.createColumn({name: "quantity", label: "Quantity"})
   ]
});
var searchResultCount = transactionSearchObj.runPaged().count;
log.debug("transactionSearchObj result count",searchResultCount);
var itemArray=[];
transactionSearchObj.run().each(function(result){
    var itemObj={};
  itemObj.item=result.getValue({ name: 'item' });
   itemObj.lineId=result.getValue({ name: 'line' });
   var cancelQty=result.getValue({ name: 'custcol_cancel_qty' });
   var actualQty=result.getValue({ name: 'quantity' });
   if(cancelQty==0)
   {
    itemObj.netAmount=result.getValue({ name: 'netamount' });
}
else
{
    if(actualQty==cancelQty){
         itemObj.netAmount=0;}
     else
     {
       var discountedRate=result.getValue({ name: 'netamount' })/actualQty;
        itemObj.netAmount=discountedRate*(actualQty-cancelQty);
     }
}

   
    itemObj.type=result.getValue({ name: 'type',join:'item' });
   log.debug("itemObj",itemObj);
   itemArray.push(itemArray);
   return true;
});

/*
transactionSearchObj.id="customsearch1664303971366";
transactionSearchObj.title="Custom Transaction Search 2 (copy)";
var newSearchId = transactionSearchObj.save();
*/
    }

  

    return {
         afterSubmit: afterSubmit
       
    };
    
});
