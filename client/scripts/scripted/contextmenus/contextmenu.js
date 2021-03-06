/*******************************************************************************
 * @license Copyright (c) 2012 VMware, Inc. All Rights Reserved. THIS FILE IS
 *          PROVIDED UNDER THE TERMS OF THE ECLIPSE PUBLIC LICENSE
 *          ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS FILE
 *          CONSTITUTES RECIPIENTS ACCEPTANCE OF THE AGREEMENT. You can obtain a
 *          current copy of the Eclipse Public License from
 *          http://www.opensource.org/licenses/eclipse-1.0.php
 * 
 * Contributors: Nieraj Singh - initial implementation
 ******************************************************************************/

define(
['scripted/contextmenus/contextmenuprovider', 'jquery'],

function(contextMenuProvider) {

	var loggingCategory = "CONTEXT_MENU";

	var contextMenuClass = "context_menu";

	var contextMenuItemClass = "context_menu_item";

	var currentContextMenu = {};

	var hideContextMenu;

	var addClickHandler = function(menudiv, menuItem, menuTable,
		selectedContext) {
			menudiv.click(function() {

				if (menuItem.handler && (typeof menuItem.handler === "function")) {
					hideContextMenu(menuTable);
					menuItem.handler(selectedContext);
				}
			});
		};

	var createContextMenu = function(menus, selectedContext) {

			if (menus) {

				if (!$.isArray(menus)) {
					menus = [menus];
				}

				var mainDiv = $('<div class="' + contextMenuClass + '"></div>');

				for (var i = 0; i < menus.length; i++) {
					var menuItem = menus[i];
					if (menuItem.name && menuItem.handler && (typeof menuItem.handler === "function")) {

						var menudiv = $('<div class="' + contextMenuItemClass + '">' + menuItem.name + '</div>');
						addClickHandler(menudiv, menuItem, mainDiv,
						selectedContext);
						mainDiv.append(menudiv);
					}
				}
				return mainDiv;
			}

		};



	var getPosition = function(clickX, clickY, relativeToContextID) {
			var x = clickX;
			var y = clickY;

			if (relativeToContextID && $(relativeToContextID).size() > 0) {
				var contextOffset = $(relativeToContextID).offset();
				// Take into account the context and position to the right of the mouse click
				x += contextOffset.left;

				y -= contextOffset.top;
			}
			return {
				'x': x,
				'y': y
			};
		};

	var showContextMenu = function(context, contextMenu, eventContext) {

			if (currentContextMenu) {
				$(currentContextMenu).remove();
			}

			if (!contextMenu || !eventContext) {
				return;
			}

			if (contextMenu) {
				$(context).append(contextMenu);
			}

			var eventx = eventContext.pageX;
			var eventy = eventContext.pageY;

			// Hardcode navigator wrapper as the context for now. Refactor when context menus should be more general
			var position = getPosition(eventx, eventy, "#navigator-wrapper");

			// reposition context menu based on mouse click
			contextMenu.css({
				top: position.y + "px",
				left: position.x + "px"
			});

			$(document).one('click', null, function() {
				hideContextMenu(contextMenu);
			});

		};

	hideContextMenu = function(contextMenu) {
		if (contextMenu) {
			$(contextMenu).remove();
		}
	};

	var initContextMenus = function(context) {

			var error = null;
			if (!context) {
				error = "No context provided for context menu. Unable to open context menu.";
			} else if (!$(context).size()) {
				error = "Unable to find context element to display its context menu " + context.toString();
			}

			if (error) {
				scriptedLogger.error(error, loggingCategory);
				return;
			}

			$(function() {
				$(context).contextmenu(

				function(e) {
					var menus = contextMenuProvider.getContextMenusForSelection(
					context, e);
					if (menus) {
						var cmenu = createContextMenu(
						menus, e);
						if (cmenu) {
							showContextMenu(context, cmenu,
							e);
							currentContextMenu = cmenu;
							e.preventDefault();
						}
					}
				});
			});

		};

	return {
		initContextMenus: initContextMenus,
		loggingCategory: loggingCategory
	};

});