/* Author: Ryan Westphal

*/

$(function () {
  var apiKey = '' //obtain from http://developer.mapserv.utah.gov/AccountAccess
  
  $("#basemapButtons").buttonset().find("label").click(function () {
    var inputId = $(this).attr("for"),
        $basemapInput = $("#" + inputId),
        basemapValue = $basemapInput.val(),
        tileSize = parseInt($basemapInput.data("tileSize")),
        serviceOptions = makeService(basemapValue, tileSize);

    $("#map").geomap("option", {
      tilingScheme: serviceOptions.tilingScheme,
      services: serviceOptions.services,
      center: $("#map").geomap("option", "center")
    });
  });

  var options = $.extend( { }, makeService("Lite", 256), {
          center: [453709, 4333922],
          zoom: 2,
          move: function (e, geo) {
            $("#lblCoords>span").text("" + geo.coordinates);
          }
        } );

  $("input[value='Lite']").prop("checked", true);

  $("#pnlSearch form").submit(function (e) {
    e.preventDefault();

    var searchText = $(this).find( "input" ).val( );

    if ( searchText ) {
      if ( searchText.indexOf( ',' ) < 0 ) {
        // city only
        $.ajax({
          url: "http://api.mapserv.utah.gov/api/v1/search/SGID10.BOUNDARIES.Municipalities/shape@envelope?predicate=name+%3D+'" + $.trim( searchText ) + "'&apiKey=" + apiKey,
          dataType: "jsonp",
          success: function (result) {
            if ( !result || result.result.lengh === 0) {
              displayMessage( "Sorry, we could not find a city with that name" );
            } else {
              var bbox = result.result[ 0 ].geometry.rings[0];
              $("#map").geomap("option", {
                bbox: [ bbox[0], bbox[1], bbox[2], bbox[3] ]
              });
            }
          },
          error: function (xhr) {
            displayMessage(xhr.statusText);
          }
        });
      } else {
        var address = $(this).find("input").val().replace(/,\s*UT/i, ""),
            addressParts = address.split(",");

        if (addressParts.length >= 2) {
          address = address.replace(addressParts[addressParts.length - 1], "").replace(",", "");
          $.ajax({
            url: "http://api.mapserv.utah.gov/api/v1/geocode/" + $.trim(address) + "/" + $.trim(addressParts[addressParts.length - 1]) + "?apiKey=" + apiKey,
            dataType: "jsonp",
            success: function (result) {
              $("#map").geomap("option", {
                center: [result.location.x, result.location.y],
                zoom: 13
              });
            },
            error: function (xhr) {
              displayMessage(xhr.statusText);
            }
          });
        } else {
          displayMessage("Please enter both a street address and either a city or zip separated by a comma");
        }
      }
    }

    return false;
  });

  $.geo.proj = null;
  $("#map").geomap(options);

  function displayMessage(msg) {
    $("#infoBar").html(msg).fadeTo(0, 1.0).delay(5000).fadeOut("slow");
  }

  function makeService(name, tileSize) {
    return {
      services: [
        {
          type: "tiled",
          src: "http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/" + name + "/MapServer/tile/{{:zoom}}/{{:tile.row}}/{{:tile.column}}",
          attr: "&copy; AGRC"
        }
      ],
      tilingScheme: {
        tileWidth: tileSize,
        tileHeight: tileSize,
        pixelSizes: [
          4891.96999883583,
          2445.98499994708,
          1222.99250010583,
          611.496250052917,
          305.748124894166,
          152.8740625,
          76.4370312632292,
          38.2185156316146,
          19.1092578131615,
          9.55462890525781,
          4.77731445262891,
          2.38865722657904,
          1.19432861315723,
          0.597164306578613,
          0.298582153289307
        ],
        origin: [-5120900, 9998100]
      }
    }
  }
});
