/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],
/**
 * @param {N} N
 * @param {auth} auth
 * @param {config} config
 * @param {crypto} crypto
 * @param {currency} currency
 * @param {email} email
 * @param {encode} encode
 * @param {error} error
 * @param {file} file
 * @param {format} format
 * @param {http} http
 * @param {https} https
 * @param {plugin} plugin
 * @param {portlet} portlet
 * @param {record} record
 * @param {redirect} redirect
 * @param {render} render
 * @param {runtime} runtime
 * @param {search} search
 * @param {sso} sso
 * @param {task} task
 * @param {transaction} transaction
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 * @param {serverWidget} serverWidget
 * @param {url} url
 * @param {workflow} workflow
 * @param {xml} xml
 */
function() {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

scriptContext.newRecord.setValue({
   fieldId: 'cc',
   value: 'sombody1.email@nodomain.com',
   });
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

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

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
