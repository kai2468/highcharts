/* *
 *
 *  (c) 2010-2024 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type ColumnItemPoint from './ColumnItemPoint';
import type ColumnItemSeriesOptions from './ColumnItemSeriesOptions';

import ColumnSeries from '../Column/ColumnSeries.js';
import SeriesRegistry from '../../Core/Series/SeriesRegistry.js';

import type ColumnPoint from './../Column/ColumnPoint';
import type SVGAttributes from '../../Core/Renderer/SVG/SVGAttributes';

import A from '../../Core/Animation/AnimationUtilities.js';
const { animObject } = A;
import H from '../../Core/Globals.js';
const { noop } = H;
import U from '../../Core/Utilities.js';
import DataLabelOptions from '../../Core/Series/DataLabelOptions';
import SVGLabel from '../../Core/Renderer/SVG/SVGLabel';
import Series from '../../Core/Series/Series';
import BBoxObject from '../../Core/Renderer/BBoxObject';
const { extend, merge, clamp, fireEvent, isArray } = U;

/* *
 *
 *  Declarations
 *
 * */
declare module '../../Core/Series/SeriesLike' {
  interface SeriesLike {
    barW?: number;
    pointXOffset?: number;
  }
}

/* *
 *
 *  Class
 *
 * */

/**
 * Column item series type.
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.columnitem
 *
 * @augments Highcharts.Series
 */
class ColumnItemSeries extends ColumnSeries {
  /* *
   *
   *  Static Properties
   *
   * */

  /**
   * A columnitem series is a special type of column series where the columns are
   * filled with items
   *
   * @sample highcharts/demo/column-basic/
   *         columnitem chart
   *
   * @extends      plotOptions.column
   * @product      highcharts
   * @optionparent plotOptions.columnitem
   */

  public static defaultOptions: ColumnItemSeriesOptions = merge(ColumnSeries.defaultOptions, {});

  //  public static defaultOptions = merge(Series.defaultOptions, merge(, ColumnSeriesDefaults));

  /* *
   *
   *  Properties
   *
   * */
  /* eslint-disable valid-jsdoc */

  /**
   * Animate the column heights one by one from zero.
   *
   * @private
   * @function Highcharts.seriesTypes.columnitem#animate
   *
   * @param {boolean} init
   *        Whether to initialize the animation or run it
   */
  public animate(init: boolean): void {
    const series = this,
      yAxis = this.yAxis,
      yAxisPos = yAxis.pos,
      options = series.options,
      inverted = this.chart.inverted,
      attr: SVGAttributes = {},
      translateProp = 'opacity'; // 'translateX' | 'translateY' = inverted ? 'translateX' : 'translateY';
    let translateStart: number, translatedThreshold;

    if (init) {
      attr.opacity = 1; //0.1;
      translatedThreshold = clamp(yAxis.toPixels(options.threshold as any), yAxisPos, yAxisPos + yAxis.len);
      if (inverted) {
        // attr.translateX = translatedThreshold - yAxis.len;
      } else {
        //  attr.translateY = translatedThreshold;
      }

      // apply final clipping (used in Highcharts Stock) (#7083)
      // animation is done by scaleY, so clipping is for panes
      if (series.clipBox) {
        series.setClip();
      }

      series.group.attr(attr);
    } else {
      // run the animation
      translateStart = Number(series.group.attr(translateProp));
      series.group.animate(
        { opacity: 1 },
        extend(animObject(series.options.animation), {
          // Do the scale synchronously to ensure smooth
          // updating (#5030, #7228)
          step: function (val: any, fx: any): void {
            if (series.group) {
              attr[translateProp] = val + 0.01;
              series.group.attr(attr);
            }
          }
        })
      );
    }
  }

  public fitBoxes(containerWidth: number, containerHeight: number, numBoxes: number) {
    const containerArea = containerWidth * containerHeight;
    const boxArea = containerArea / numBoxes;
    const boxWidth = Math.sqrt(boxArea);
    const boxHeight = boxWidth; // Box dimension is always a square with this method
    const numColumns = Math.floor(containerWidth / boxWidth);
    const numRows = Math.ceil(numBoxes / numColumns);

    return {
      width: boxWidth,
      height: boxHeight,
      numColumns: numColumns,
      numRows: numRows
    };
  }

  /**
   * Draw the columns. For bars, the series.group is rotated, so the same
   * coordinates apply for columns and bars. This method is inherited by
   * scatter series.
   *
   * @private
   * @function Highcharts.seriesTypes.columnitem#drawPoints
   */

  public drawPoints(points: Array<ColumnItemPoint> = this.points): void {
    const barWidth = points?.[0]?.shapeArgs?.width ?? 0,
      barHeight = (this.translatedThreshold ?? 0) - 35,
      maxValue = this.options?.maxValue ?? 100,
      inverted = this.chart.inverted;

    const { width: size, numColumns } = this.fitBoxes(barWidth, barHeight, maxValue);
    let i = 0;
    for (const point of points) {
      const shapeArgs = point.shapeArgs,
        graphics = (point.graphics = point.graphics || []);

      const isNegative = (point?.y ?? 0) < 0;
      const positiveYValue = Math.abs(point?.y ?? 0);

      let x = (shapeArgs?.x ?? 0) + size,
        y = isNegative ? shapeArgs?.y ?? 0 : (shapeArgs?.y ?? 0) + (shapeArgs?.height ?? 0) - size;

      if (!point.graphic) {
        point.graphic = this.chart.renderer.g('point').add(this.group);
      }

      for (let val = 0; val < positiveYValue; val++) {
        const attr = {
          x,
          y,
          ...this.pointAttribs(point)
        };

        let graphic = graphics[val];
        if (graphic) {
          attr.width = attr.height = size;
          graphic.animate(attr, { duration: 0 });
        } else {
          const p = this.chart.renderer.rect(x, y, size, size).attr(attr);
          graphic = p.add(point.graphic);
        }
        graphic.isActive = true;
        graphics[val] = graphic;

        x += size;

        if (!((val + 1) % numColumns)) {
          // Go onto next line if at the end of current row
          x = (shapeArgs?.x ?? 0) + size;
          y = isNegative ? y + size : y - size;
        }
      }

      // Set tooltip position
      const bbox = point.graphic?.getBBox();
      point.tooltipPos = inverted ? [bbox.y, bbox.x] : [bbox.x + bbox.width / 2, bbox.y];
      i++;
    }
  }

  public alignDataLabel(
    this: Series,
    point: ColumnItemPoint,
    dataLabel: SVGLabel,
    options: DataLabelOptions,
    alignTo: BBoxObject | undefined,
    isNew?: boolean
  ): void {
    const bbox = point.graphic?.getBBox();

    point.dlBox = {
      x: bbox?.x ?? 0,
      y: bbox?.y ?? 0,
      height: bbox?.height ?? 0,
      width: bbox?.width ?? 0
    };

    super.alignDataLabel(point, dataLabel, options, alignTo, isNew);
  }
}

/* *
 *
 *  Class Prototype
 *
 * */

interface ColumnItemSeries {
  pointClass: typeof ColumnPoint;
  series: any;
}

extend(ColumnItemSeries.prototype, {
  // When tooltip is not shared, this series (and derivatives) requires
  // direct touch/hover. KD-tree does not apply.
  directTouch: true,
  getSymbol: noop,

  // Use separate negative stacks, unlike area stacks where a negative
  // point is subtracted from previous (#1910)
  negStacks: true,

  trackerGroups: ['group', 'dataLabelsGroup']
});

/* *
 *
 *  Registry
 *
 * */

declare module '../../Core/Series/SeriesType' {
  interface SeriesTypeRegistry {
    columnitem: typeof ColumnItemSeries;
  }
}
SeriesRegistry.registerSeriesType('columnitem', ColumnItemSeries);

/* *
 *
 *  Default Export
 *
 * */

export default ColumnItemSeries;

(''); // gets doclets above into transpiled
