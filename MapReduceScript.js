/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N', 'N/auth', 'N/config', 'N/crypto', 'N/currency', 'N/email', 'N/encode', 'N/error', 'N/file', 'N/format', 'N/http', 'N/https', 'N/plugin', 'N/portlet', 'N/record', 'N/redirect', 'N/render', 'N/runtime', 'N/search', 'N/sso', 'N/task', 'N/transaction', 'N/ui', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget', 'N/url', 'N/workflow', 'N/xml'],
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
function(N, auth, config, crypto, currency, email, encode, error, file, format, http, https, plugin, portlet, record, redirect, render, runtime, search, sso, task, transaction, ui, dialog, message, serverWidget, url, workflow, xml) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {

    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
