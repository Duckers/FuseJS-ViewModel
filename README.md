
# FuseJS ViewModel API (proposal)

This repo will contain documentation, implementation, tests and examples for a new ViewModel API that we propose to add to a future version of Fuse if it turns out well.

This is an open source effort, pull requests are welcome.

## Synopsis

The `ViewModel` API is a plain JavaScript wrapper on top of the `Observable` API that provides a familiar looking component infrastructure 
to people coming from Vue, Angular, React and similar frameworks. Instead of having the user to juggle raw observables, with all their
unfamiliar oddities, `ViewModel` wraps a components internals in a well defined structure where there is less room for errors
and improvisation on a component-by-component basis. 

## Motivation

* Plain Observables are somewhat hard to teach, hard to learn and hard to debug. In particular, newbies are often confused by the asynchronous nature of observables and the fact that no data flows unles they are subscirbed to.
* Many JS developers are more familiar with a stricter component model (Vue, React, Angular).
* The current (0.27) vanilla Fuse pattern encourages non-strict view model code, where `this` has a defined meaning in the root scope  and non-standard symbols are injected. This `ViewModel` class intends to wraps that up so we get complete strict mode.
* `ViewModel` can be implemented as a plain JS layer that results in a tree of Observables, requiring no new protocol between JS and UX.

## Usage

`ViewModel` objects are created by calling the `ViewModel` function:

	var ViewModel = require("FuseJS/ViewModel");

	var vm = ViewModel(module, { /* descriptor */ });

A `ViewModel` is passed the current `module`  to manage lifetimes of event listeners and observable subscriptions automatically. It also
gives access to the root object `this` and other symbols injected, enables strict mode access to these symbols.

In a common and recommended UX markup scenario, each `ux:Class` has its own `ViewModel` in `<JavaScript>`, which makes up the entire `module.exports`.

## Todo-app example

	<Page ux:Class="TodoPage">
		<JavaScript>
			var ViewModel = require("FuseJS/ViewModel");

			module.exports = ViewModel(module, { 

				state: {
					tasks: [],
					newTask: ""
				},

				computed: {
					tasksRemainingLabel: function (){
						var count = this.tasks.filter(function(x) { return !x.isDone; }).length;
						return "There are " + count + " remaining tasks."
					}
				},

				methods: {
					addTask: function() {
						tasks.add({ label: this.newTask, isDone: false });
						this.newTask = "";
					}
				},

				onchanged: {
					Parameter: function(p) {
						debug_log "The parameter to this page changed to " + JSON.stringify(p);
					}
				}
			}
		</JavaScript>
		<Each Items="{tasks}">
			<StackPanel Orientation="Horizontal">
				<Text Value="{label}" />
				<Switch Value="{isDone}" />
			</StackPanel>
		</Each>
	</Page>



## Descriptors

The `/* descriptor */` mentioned above is an object with certain sections.

### States

The `state` section of the descriptor holds plain data variables that may change over the lifetime of the component.

	state: {
		tasks: [],
		newTask: ""
	} 

The `state` should only be modified by `methods` and `events`.

### Computed values

The `computed` section of the descriptor holds functions that compute values derived from the `state`. When states change, the `ViewModel` automatically
detects what `computed` functions need to re-evaluate. 

	computed: {
		tasksRemainingLabel: function (){
			var count = this.tasks.filter(function(x) { return !x.isDone; }).length;
			return "There are " + count + " remaining tasks."
		}
	}

## Methods

The `methods` section hold functions that the view can call to make logical operations on the component.

	methods: {
		addTask: function() {
			tasks.add({ label: this.newTask, isDone: false });
			this.newTask = "";
		}
	},

## Property change handlers

The `onchanged` section holds functions that react to changes in UX properties (`ux:Property`) on the component.

	onchanged: {
		Parameter: function(p) {
			debug_log "The parameter to this page changed to " + JSON.stringify(p);
		}
	}

> The `onchanged` feature depends on proposed Fuse changes not yet in production.