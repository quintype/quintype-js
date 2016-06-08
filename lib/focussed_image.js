var _ = require("lodash");

function findLeftBound(imageWidth, halfCropWidth, focusPoint) {
  if (focusPoint - halfCropWidth < 0) {
    return 0;
  }
  else if (focusPoint + halfCropWidth > imageWidth) {
    return imageWidth - halfCropWidth;
  }
  else {
    return focusPoint - halfCropWidth;
  }
}

function findBounds(imageWidth, cropWidth, focusPoint) {
  var leftBound = findLeftBound(imageWidth, cropWidth / 2, focusPoint);
  if (leftBound + cropWidth > imageWidth) {
    return (imageWidth - cropWidth);
  }
  else {
    return leftBound;
  }
}

function imageBounds(imageDimensions, aspectRatio, focusPoint) {
  var expectedHeight, expectedWidth, bound;
  if (imageDimensions[0] * aspectRatio[1] < imageDimensions[1] * aspectRatio[0]) {
    // Use the entire width
    expectedHeight = (imageDimensions[0] * aspectRatio[1]) / aspectRatio[0];
    bound          = findBounds(imageDimensions[1], expectedHeight, focusPoint[1]);
    return [0, _.round(bound), imageDimensions[0], _.round(expectedHeight)];
  } else {
    // Use the entire height
    expectedWidth = (imageDimensions[1] * aspectRatio[0]) / aspectRatio[1];
    bound         = findBounds(imageDimensions[0], expectedWidth, focusPoint[0]);
    return [_.round(bound), 0, _.round(expectedWidth), imageDimensions[1]];
  }
}

function imgixPath(opts) {
  if(_.isEmpty(opts))
    return "";

  return "?" + _.chain(opts) .map((value, key) => key + "=" + (_.isArray(value) ? _.join(value, ",") : value)) .join("&") .value();
}

function FocussedImage(slug, metadata) {
  this.slug = slug;
  this.metadata = metadata;
}

FocussedImage.prototype.path = function(aspectRatio, opts) {
  rectOpts = {};
  if(this.metadata && this.metadata["height"] && this.metadata["width"] && this.metadata["focus-point"]) {
    rectOpts["rect"] = imageBounds([this.metadata["width"], this.metadata["height"]], aspectRatio, this.metadata["focus-point"]);
  }

  return imgixPath(_.extend(rectOpts, opts));
}

FocussedImage.imageBounds = imageBounds;

module.exports = FocussedImage;
