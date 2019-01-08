define([
        'dojo/Evented',
        'dojo/_base/declare',
        'dojo/_base/event',
        'dojo/_base/lang',
        'dojo/dom', 
        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/on',
        'dojo/query',
        'dijit/layout/ContentPane',
        'dijit/registry',
        //'esri/geometry/mathUtils',
        'esri/geometry/geometryEngine',
        'esri/geometry/Polyline',
        'esri/geometry/webMercatorUtils',
        'esri/tasks/query',
        'esri/tasks/QueryTask'
   ],function(
        Evented,
        declare, 
        event,
        lang, 
        dom, 
        domClass, 
        domConstruct, 
        on,
        query,
        ContentPane,
        registry,
        //mathUtils,
        geometryEngine,
        Polyline,
        webMercatorUtils,
        Query,
        QueryTask
){
   
   var proximityInfo = declare('ProximityInfo', [Evented], {

      config : null,
      map : null,
      location : null,
      container : null,
      pageObj : null,

      constructor : function(config) {
         this.config = config;
      },

      // update for location
      updateForLocation : function(location, container, pageObj) {
         this.location = location;
         this.container = container;
         this.container.innerHTML = "<br/><br/><img src='images/ajax-loader.gif'/>";
         this.pageObj = pageObj;

         this._unselectRecords();
         this.pageObj.selectedNum = null;

         var layerType = pageObj.layerType;

         if (layerType == "Feature Layer") {
            this._queryFeatures();
         } else {
            this._filterFeatures();
         }
      },

      // query features
      _queryFeatures : function() {
         // ST updated to fix Arcade expressions and domain issues
         var layer = this.pageObj.layer;
         //var url = layer.url + "?ts=" + new Date().getTime();
         //var queryTask = new QueryTask(url);
         var query = new Query();
         query.outFields = ["*"];
         query.maxAllowableOffset = 0;
         query.returnGeometry = true;
         if (this.pageObj.defExp)
            query.where = this.pageObj.defExp;
         query.geometry = this.pageObj.buffer;
         query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
         //queryTask.execute(query, lang.hitch(this, this._resultsHandler), lang.hitch(this, this._errorHandler));
         layer.queryFeatures(query, lang.hitch(this, this._resultsHandler), lang.hitch(this, this._errorHandler));
      },

      // filter features
      _filterFeatures : function() {
         var buffer = this.pageObj.buffer;
         var layer = this.pageObj.layer;
         var features = [];
         for (var i = 0; i < layer.graphics.length; i++) {
            var gra = layer.graphics[i];
            var geom = gra.geometry;
            var pt = geom;
            if (geom.type != "point")
               pt = this._getPointForGeometry(geom);
            if (buffer.contains(pt)) {
               features.push(gra);
            }
         }
         this._resultsHandler({
            features : features
         });
      },

      // results handler
      _resultsHandler : function(results) {
         this.container.innerHTML = "";

         var proximityFeatures = [];
         var features = results.features;
         if (features.length > 0) {

            // process features
            for (var i = 0; i < features.length; i++) {
               var gra = features[i];
               var geom = gra.geometry;
               var pt = geom;
               if (geom.type != "point")
                  pt = this._getPointForGeometry(geom);
               var dist = this._getDistance(pt);
               gra.attributes.DISTANCE = dist;
               gra.attributes.POINT_LOCATION = pt;
               gra.setInfoTemplate(this.pageObj.layer.infoTemplate);
               proximityFeatures.push(gra);
            }

            // sort by distance
            proximityFeatures.sort(this._compareDistance);
            this.pageObj.proximityFeatures = proximityFeatures.slice();

            // create content
            var content = domConstruct.create("div", {
            }, this.container);
            domClass.add(content, 'resultsContent');

            for (var i = 0; i < proximityFeatures.length; i++) {
               var feature = proximityFeatures[i];
               var geom = feature.geometry;
               var dist = feature.attributes.DISTANCE;

               var num = i + 1;
               
               //rec
               var rec = domConstruct.create("div", {
                  id : 'rec_' + this.pageObj.id + '_' + i
               }, content);
               domClass.add(rec, 'recProximity');
               
               //header
               var recHeader = domConstruct.create("div", {
               }, rec);
               domClass.add(recHeader, 'recHeader');
               on(recHeader, "click", lang.hitch(this, this._selectRecord, i));
               
               // num
               var recNum = domConstruct.create("div", {
                  style : "background-color:" + this.pageObj.color,
                  innerHTML : num
               }, recHeader);
               domClass.add(recNum, 'recNum');
               
               //headerInfo
               var recHeaderInfo = domConstruct.create("div", {
               }, recHeader);
               domClass.add(recHeaderInfo, 'recHeaderInfo');

               // info
               var info = feature.getTitle();
               if (info === "") {
                  info = this.pageObj.label;
               }
               
               // distance
               var infoDist = "~" + Math.round(dist * 100) / 100 + " " + this.config.distanceUnits.toUpperCase();
               
               recHeaderInfo.innerHTML = info +"<br/><span class='recDist'>" + infoDist + "</span>";
               
               // directions
               var tip = "Directions";
               if (this.config && this.config.i18n) {
                  tip = this.config.i18n.tooltips.directions;
               }
               //if (geom.type == "point" && this.config.showDirections == true) {
               if (this.config.showDirections === true || this.config.showDirections === "true") {
                  var recRoute = domConstruct.create("div", {
                     title: tip
                  }, recHeader);
                  domClass.add(recRoute, 'recRoute');
                  //on(recRoute, "click", lang.hitch(this, this._routeToLocation, pt));
                  recRoute.select = lang.hitch(this, this._selectRoute);
                  on(recRoute, "click", lang.partial(recRoute.select, i));
               }
               
               //body
               var recBody = domConstruct.create("div", {
                  id : 'recBody_' + this.pageObj.id + '_' + i
               }, rec);
               domClass.add(recBody, 'recBody');
            }

         }
         dom.byId("pageCounter_" + this.pageObj.id).innerHTML = proximityFeatures.length;
         this.emit('updated', {
            data : proximityFeatures
         });
      },

      // error handler
      _errorHandler : function(error) {
         this.container.innerHTML = "";
         domConstruct.create("div", {
            innerHTML : error.message
         }, this.container);
         this.emit('updated', {
            data : null
         });
      },

      // get point for geometry
      _getPointForGeometry : function(geom) {
         if (geom.type == "polygon")
            return geom.getCentroid();
         if (geom.type == "polyline") {
            var pathNum = Math.floor(geom.paths.length / 2);
            var ptNum = Math.floor(geom.paths[pathNum].length / 2);
            return geom.getPoint(pathNum, ptNum);
         }
         return geom.getExtent().getCenter();
      },


      // get distance
      // _getDistance : function(loc) {
      //    var dist = 0;
      //    dist = mathUtils.getLength(this.location, loc) * 0.000621371;
      //    if (this.config.distanceUnits === "kilometers") {
      //       dist = dist * 1.60934;
      //    } else if (this.config.distanceUnits === "meters") {
      //       dist = dist * 1609.34;
      //    }
      //    return dist;
      // },

      // get distance
      _getDistance: function(geom1) {
         var dist = 0;
         var geom2 = this.location;
         if (geom1.spatialReference.wkid === 4326) {
           geom1 = webMercatorUtils.geographicToWebMercator(geom1);
         }
         if (geom2.spatialReference.wkid === 4326) {
           geom2 = webMercatorUtils.geographicToWebMercator(geom2);
         }
         var units = this.config.distanceUnits;
         var geomLine = new Polyline(geom1.spatialReference);
         geomLine.addPath([geom1, geom2]);
         if (geom1.spatialReference.isWebMercator()) {
           dist = geometryEngine.geodesicLength(geomLine, 9001);
         } else {
           dist = geometryEngine.planarLength(geomLine, 9001);
         }
         switch (units) {
           case "miles":
             dist *= 0.000621371;
             break;
           case "kilometers":
             dist *= 0.001;
             break;
         }
         return dist;
      },

      // zoom to location
      _zoomToLocation : function(gra) {
         var loc = gra.attributes.POINT_LOCATION;
         //this.map.centerAndZoom(loc, this.config.defaultZoomLevel || 14);
         this.map.centerAt(loc);
      },

      // route to location
      _routeToLocation : function(loc) {
         if (this.config.showDirections)
            this.emit('route', {
               data : loc
            });
      },

      // compare distance
      _compareDistance : function(a, b) {
         if (a.attributes.DISTANCE < b.attributes.DISTANCE)
            return -1;
         if (a.attributes.DISTANCE > b.attributes.DISTANCE)
            return 1;
         return 0;
      },

      // Select Feature
      selectFeature : function(gra) {
         var num = gra.id;
         num = num.replace("R_", "").replace("T_", "");
         this._selectRecord(parseInt(num), false);
      },
      
      // Select Record
      _selectRecord : function(num, zoom) {
         if(typeof(zoom)==='undefined') {
            zoom = true;
         }
         this._unselectRecords();
         if (num != this.pageObj.selectedNum) {
            this._highlightRecord(num, zoom);
         } else {
            this.pageObj.selectedNum = null;
            this.emit('highlight', {
               data : null
            });
         }
      },
      
      // Highlight Record
      _highlightRecord : function(num, zoom) {
         this.pageObj.selectedNum = num;
         if (this.pageObj.proximityFeatures) {
            var gra = this.pageObj.proximityFeatures[num];
            this.emit('highlight', {
               data : gra
            });
            if (zoom)
               this._zoomToLocation(gra);
            var rec = dom.byId("rec_" + this.pageObj.id + "_" + num);
            if (rec) {
               domClass.add(rec, "recOpened");
               var recB = dom.byId("recBody_" + this.pageObj.id + "_" + num);
               var recDetails = domConstruct.create("div", {
                  id: "recDetails"
               }, recB);
               domClass.add(recDetails, "recDetails");
               var cp = new ContentPane({
                  id: "recPane"
               });
               cp.placeAt('recDetails', 'last');
               cp.startup();
               var content = gra.getContent();
               registry.byId("recPane").set("content", content);
               if (!zoom) {
                  setTimeout(lang.hitch(this, this._updatePosition), 300);
               }
            }
         }
      },
      
      // Select Route
      _selectRoute : function(num, evt) {
         event.stop(evt);
         this._showRoute(num);
      },
      
      // Show Route
      _showRoute : function(num) {
         this._unselectRecords();
         this._highlightRecord(num, true);
         var gra = this.pageObj.proximityFeatures[num];
         this._routeToLocation(gra.attributes.POINT_LOCATION);
      },

      // Unselect Records
      _unselectRecords : function() {
         if (registry.byId("recPane"))
            registry.byId("recPane").destroy();
         domConstruct.destroy("recDetails");
         query(".recOpened").forEach(function(node) {
            domClass.remove(node, "recOpened");
         });
      },

      // Update Position
      _updatePosition : function() {
         var num = this.pageObj.selectedNum;
         var pos = num * 60;
         this.container.scrollTop = pos;
      },
      
      // Update Selection
      updateSelection : function() {
         this._unselectRecords();
         if (this.pageObj && this.pageObj.selectedNum >= 0) {
            var num = this.pageObj.selectedNum;
            this._unselectRecords();
            this._highlightRecord(num, false);
         }
            
      },

      // Clear Selection
      clearSelection : function() {
         this.pageObj.selectedNum = null;
         this._unselectRecords();
      }
      
   });

   return proximityInfo;

}); 