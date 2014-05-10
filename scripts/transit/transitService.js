var extensions = require('../helpers/Extensions'),
	TransitService = {

	util : require('util'),
	http : require('http'),
	fs : require('fs'),
	querystring : require("querystring"),
	xml2js : require('xml2js'),
	token : "",
	serviceBaseUrl : "http://services.my511.org/Transit2.0",
	parseString : require('xml2js').parseString,
	request : require('request'),

	inject : function(services) {
		this.util = services.util || this.util;
		this.http = services.http || this.http;
		this.fs = services.fs || this.fs;
		this.querystring = services.querystring || this.querystring;
		this.xml2js = services.xml2js || this.xml2js;
		this.parseString = services.parseString || this.parseString;
		this.request = services.request || this.request;		
	},

	// GetAgencies.aspx?token=123-456-789

	getAgencies : function(request, callback) {
		var self = TransitService,
			fullUrl = this.serviceBaseUrl + '/GetAgencies.aspx?token=' + this.token;

		self.request(fullUrl, function(error, response, body){
			callback(body);
		});

	},

	// GetRoutesForAgency.aspx?token=123-456-789&agencyName

	getRoutesForAgency : function(request, callback) {
		var params = JSON.parse(request),
			self = TransitService,
			fullUrl = self.serviceBaseUrl + '/GetRoutesForAgency.aspx?token=' + self.token + "&agencyName=" + params.agencyName;

		self.request(fullUrl, function(error, response, body){
			callback(body);
		});
	},

	getStopsForRoute : function(request, callback) {
		var self = TransitService,
			params = JSON.parse(request);

		var fullUrl = self.serviceBaseUrl
					+ '/GetStopsForRoute.aspx?token='
					+ self.token
					+ "&routeIDF="
					+ params.agencyName
					+ "~"
					+ params.routeCode;

		if (params.routeDirectionCode) {
			fullUrl += "~"
					+ params.routeDirectionCode;
		}

		self.request(fullUrl, function(error, response, body){
			callback(body);
		});
	},

	// GetNextDeparturesByStopName
	// http://services.my511.org/Transit2.0/GetNextDeparturesForStopName.aspx?token=123-456-789&agencyName=BART&stopName=Fremont

	getNextDeparturesByStopName : function(request, callback) {
		var self = TransitService,
			params = JSON.parse(request);

		var fullUrl = self.serviceBaseUrl
					+ "/GetNextDeparturesByStopName.aspx?token="
					+ self.token
					+ "&agencyName="
					+ params.agencyName
					+ "&stopName="
					+ params.stopName;

		self.request(fullUrl, function(error, response, body){
			callback(body);
		});
	},

	// GetNextDeparturesByStopCode

	getNextDeparturesByStopCode : function(request, callback) {
		var self = TransitService,
			params = JSON.parse(request);

		var fullUrl = self.serviceBaseUrl
					+ "/GetNextDeparturesByStopCode.aspx?token="
					+ self.token
					+ "&stopcode="
					+ params.stopCode;

		self.request(fullUrl, function(error, response, body){
			callback(body);
		});
	}

};

exports.inject = extensions.bind(TransitService.inject, TransitService);
exports.getAgencies = extensions.bind(TransitService.getAgencies, TransitService);
exports.getRoutesForAgency = extensions.bind(TransitService.getRoutesForAgency, TransitService);
exports.getStopsForRoute = extensions.bind(TransitService.getStopsForRoute, TransitService);
exports.getNextDeparturesByStopName = extensions.bind(TransitService.getNextDeparturesByStopName, TransitService);
exports.getNextDeparturesByStopCode = extensions.bind(TransitService.getNextDeparturesByStopCode, TransitService);
