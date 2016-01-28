$(function () {

  var categoriesContext;
  var productsContext;
  var productSingleContext;

  var categoryID ="departments";
  var pageTracker = 1;
  var currentCatID;
  var totalPages;

  // first thing's first: Call API to get categories and populate initial products.
  $.ajax({
    async: false,
    url: "http://www.bestbuy.ca/api/v2/json/category/departments",
    method: "get",
    dataType: "jsonp"
  }).done(function(resp) {
    categoriesContext = resp;
	// console.log(resp);
    populateHandlebars(categoriesContext, "#categories-template", ".categories");
      getProducts(categoryID);
  })

  // bind response data as context to Handlebars template
  function populateHandlebars(context, templateId, targetClass) {
    var theTemplateScript = $(templateId).html();
    var theTemplate = Handlebars.compile(theTemplateScript);
    var theCompiledHtml = theTemplate(context);
    $(targetClass).append(theCompiledHtml);
 }

  function getProducts(catID) {
    productsURL = "http://www.bestbuy.ca/api/v2/json/search?categoryid=" + catID + "&page=" + pageTracker;
    // if new category reset pageTracker
    if (catID !== currentCatID) {
      pageTracker = 1;
    }
    $.ajax({
      async: false,
      url: productsURL,
      method: "get",
      dataType: "jsonp"
    }).done(function(resp) {
      // console.log(resp);
      productsContext = resp;
      totalPages = resp.totalPages;
      showPageCounter();
      $(".product.listing").remove();
      populateHandlebars(productsContext, "#products-template", ".products ul");
    })
  }

  function getSingleProductInfo(sku) {
    productsURL = "http://www.bestbuy.ca/api/v2/json/product/" + sku;
    $.ajax({
       async: false,
       url: productsURL,
       method: "get",
       dataType: "jsonp"
     }).done(function(resp) {
       console.log("Displaying SKU " + resp.sku);
      productSingleContext = resp;
      populateHandlebars(productSingleContext, "#singleProduct-modal-template", ".single-product")
      $(".single-product").toggleClass("hidden");
     })
  }

  // toggle active style for Category and get products
  $(".categories").on('click', 'a', function() {
    categoryID = $(this).attr('id');
    getProducts(categoryID);
    $(this).addClass("active").siblings().removeClass("active");
  });

  // raise modal for single product info
  $(".products").on('click', 'li a', function() {
    sku = $(this).attr('id');
    // clear old modal data
    $(".single-product-content").remove();
    getSingleProductInfo(sku);
  });

  // close button for modal
  $(".single-product").on('click', '.button', function() {
    $(".single-product").toggleClass("hidden");
  });

  // NEXT and PREV buttons /////////////////

  $("#next").on('click', function() {
    currentCatID = categoryID;
    pageTracker++
    enableDisablePrev();
    enableDisableNext();
    getProducts(currentCatID);
  });

  $("#prev").on('click', function() {
    currentCatID = categoryID;
    pageTracker--
    enableDisablePrev();
    enableDisableNext();
    getProducts(currentCatID);
  });

  function showPageCounter() {
    var string = "Page " + pageTracker + " of " + totalPages;
    $("#page-counter").html('<span>' + string + '</span>');
  }

  function enableDisablePrev() {
    if (pageTracker > 1) {
      $("#prev.button").attr('disabled', false);
    } else {
      $("#prev.button").attr('disabled', true);
    }
  }

  function enableDisableNext() {
    if (pageTracker < totalPages) {
      $("#next.button").attr('disabled', false);
    } else {
      $("#next.button").attr('disabled', true);
    }
  }

});
