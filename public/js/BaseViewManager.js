var transit = transit || {};

transit.BaseViewManager = {

	appEvents : transit.AppEvents,
	controller: transit.AppController,

	viewModel : {	
		selectedStop : undefined,		
		watchedRoute : undefined,
		setSelectedStop : function(element) {
			this.selectedStop = element;
		},
		getSelectedStop : function() {
			return this.selectedStop;
		},
		setWatchedRoute : function(element) {
			this.watchedRoute = element;
		},
		getWatchedRoute : function() {
			return this.watchedRoute;
		}
	},	

	toggleLoading : function(panel) {
		var overlay  = $(panel).find('.overlay'),
			visible = overlay.length == 0 ? false : overlay.css('display').toString().toLowerCase() != 'none';

		this.toggleOverlay(panel, 'loading', !visible);
	},

	toggleOverlay : function(panel, message, show) {
		var overlay  = $(panel).find('.overlay');

		if(show) {
			if(overlay.length == 0) {
				this.renderTemplate ('loading-overlay-template', panel, { message : message }, true)
				.done(function() {
					$(panel)
						.find('.overlay').toggle(show).end()
						.find('.fade').toggle(show).end();					
				});
			} else {
				$(panel)
					.find('.overlay').toggle(show).end()
					.find('.fade').toggle(show).end();				
			}
		} else {
			$(panel)
				.find('.overlay').remove().end()
				.find('.fade').remove().end();
		}		

	}			
};