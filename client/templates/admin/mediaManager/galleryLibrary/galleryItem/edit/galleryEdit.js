var getMediaIds = function () {
	// compile a list of already used images so not to display those when selecting new images
	var mediaIds = [];
	$.each($('#gridsort li'), function (index, item) {
		mediaIds.push($(item).data('mediaid'));
	});    
    return mediaIds;
};

var isNewGallery = function (item) {
	// determine if this is a newly created gallery (this item should be empty if not saved)
	return (typeof item === undefined || item === '');
};

Template.galleryEdit.helpers({
	isVisible: function () {
		if (! this.gallery._id) {
			return true;
		}
		return this.gallery.isVisible;
	},
	isNew: function () {
		// only show cancel button if this is a newly created gallery (never saved)
		return isNewGallery(this.gallery.slug);
	}
});

Template.galleryEdit.events({
	'change :input, keyup :input': function (e) {
		pageChanged(true);
	},
	'change #inputTitle:input': function (e, t) {
		if(Validation.isNotEmpty(t.find('#inputTitle').value)) {
			$('#inputTitle').closest('.form-group').removeClass('has-error');
			$('#helpTitle').addClass('hidden');
		} else {
			$('#inputTitle').closest('.form-group').addClass('has-error');
			$('#helpTitle').removeClass('hidden');
		}
	},
	'click .add-images': function (e) {
		Session.set('selected-images', getMediaIds());
	},
	'click .return-list': function (e) {
		e.preventDefault();
		if( hasPageChanged() || isNewGallery(this.gallery.slug) ) {
			if(confirm("Changes will be lost. Would you like to leave this page?")) {
				if (isNewGallery(this.gallery.slug)) { 
					Galleries.remove({ _id: this.gallery._id });
				}
				Router.go('galleryManager');
			}
		} else {
			Router.go('galleryManager');
		}
		
	},
	'click #save-gallery': function (e, t) {
		var g = {};
	    g.id = this.gallery._id;
		g.title = Validation.trimInput(t.find('#inputTitle').value);

		g.slug = t.find('.inputSlug').value;
		g.description  = t.find('.inputDesc').value;
		

		g.isVisible = (e.currentTarget.id === 'save-show') ? 1 : 0;

		var featEl = $('li[data-feat="1"]');

		if ( !featEl.length ) {
			// if no featured image, then set it to first image
			featEl = $('#gridsort li').first();
			setFeatured( featEl );
		}
		g.featured = featEl.data('thumb');
		g.media = getMediaData();

	    updateSaveButton('wait');

	    if (Validation.isNotEmpty(g.title)) {
	    	$('#inputTitle').closest('.form-group').removeClass('has-error');
	    	$('#helpTitle').addClass('hidden');
			try {
			  Meteor.call('updateGallery', g, function (err, id) { 
			    	if (err) {
			    		console.log(err);
			    		updateSaveButton('error');
			    	} else {
			    		updateSaveButton('complete');	
					    pageChanged(false);
			    	}
			    	
			    });
			} catch (err) {
		      updateSaveButton('error');
		    }
		} else {
			updateSaveButton('error');
			$('#inputTitle').closest('.form-group').addClass('has-error');
			$('#helpTitle').removeClass('hidden');
			pageChanged(false);

		}

	}
});

Template.galleryEdit.rendered = function () {
	$('[data-toggle="popover"]').popover({
	    trigger: 'hover',
	        'placement': 'right'
	});          
};

