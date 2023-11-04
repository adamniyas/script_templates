/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
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
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {

    }

    /**
     * Function called upon sending a PUT request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) {

    }


    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {

    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {

    }

    return {
        'get': doGet,
        put: doPut,
        post: doPost,
        'delete': doDelete
    };
    
});
