
var Observable = require("FuseJS/Observable");

function ViewModel(module, desc) {

	var model = {}
	
	var validateCallback = undefined;
	
	var self = {
		invalidate: function() {
			if (validateCallback) { return; }
			if (!("computed" in desc)) { return; }
			validateCallback = setTimeout(self.validate, 0);
		},

		validate: function() {
			if (validateCallback)
			{
				clearTimeout(validateCallback);
				for (var c in desc.computed[c]) {
					model[c].value = desc.computed[c].call(self);
				}
				validateCallback = undefined;
			}
		}
	}

	if ("states" in desc) {
		for (var s in desc.states) {

			var val = desc.states[s];
			if (val instanceof Observable) {
				model[s] = val;
				self[s] = val;
			}
			else {
				model[s] = Obserable(val);

				Object.defineProperty(self, s, {
					get: function() {
						self.invalidate();
						return model[s].value;
					},
					set: function(value) {
						model[s].value = value;
						self.invalidate();
					}
				});
			}
		}
	}

	if ("computed" in desc) {
		for (var c in desc.computed) {

			var value = desc.computed[c].call(self);
			model[c] = Observable(value);

			Object.defineProperty(self, c, {
				get: function() {
					self.validate();
					return model[c].value;
				}
			})
		}
	}

	if ("methods" in desc) {
		for (var m in desc.methods) {
			var func = function() { 
				desc.methods[m].call(self); 
				self.invalidate();
			}
			model[m] = func;
			self[m] = func;
		}
	}

	if ("onchanged" in desc) {
		// assuming module.root == "this", in regular <JavaScript> tags
		// expected to be added to Fuse soon
		var root = module.root;

		for (var e in desc.onchanged) {
			if (e in root) {
				root[e].onValueChanged(module, function(value) {
					desc.onchanged.call(self);
				})
			}
		}
	}

	if ("created" in desc) {
		desc.created.call(self);
	}

	return model;
}

module.exports = ViewModel;