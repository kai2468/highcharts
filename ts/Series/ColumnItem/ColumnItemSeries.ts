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
   * Draw the columns. For bars, the series.group is rotated, so the same
   * coordinates apply for columns and bars. This method is inherited by
   * scatter series.
   *
   * @private
   * @function Highcharts.seriesTypes.columnitem#drawPoints
   */

  public drawPoints(points: Array<ColumnItemPoint> = this.points): void {
    const total = points.reduce((acc, point) => acc + Math.abs(point.y ?? 0), 0), // Adding all point values together to make one number (total)
      totalHeight = points.reduce((acc, point) => acc + (point.shapeArgs?.height ?? 0), 0), // Adding all bar heights together to make one number (totalHeight)
      columnWidth = points[0].shapeArgs?.width ?? 0; // Column width
    const maxColumns = (this.options as ColumnItemSeriesOptions)?.maxColumns ?? 1;

    let slotsPerColumn = Math.max(1, (this.options as ColumnItemSeriesOptions)?.minColumns ?? 1), // 1 slot per column
      slotWidth = columnWidth / slotsPerColumn; // Set slot width as the whole column width to start off with

    while (slotsPerColumn < total) {
      const totalPointsValueDividedByCurrentColumnCount = total / slotsPerColumn;
      const dunno = (totalHeight / slotWidth) * 1.2;
      if (totalPointsValueDividedByCurrentColumnCount < dunno) {
        break;
      }

      // Increment slotsPerColumn and update slotWidth based on it.
      slotsPerColumn++;
      slotWidth = columnWidth / slotsPerColumn;
    }

    if (slotsPerColumn > maxColumns) {
      slotsPerColumn = maxColumns;
      slotWidth = columnWidth / slotsPerColumn;
    }

    const slotHeight = (totalHeight * slotsPerColumn) / total;
    const size = Math.min(slotWidth, slotHeight);

    for (const point of this.points) {
      const isNegative = (point?.y ?? 0) < 0;
      const positiveYValue = Math.abs(point?.y ?? 0);
      const shapeArgs = point.shapeArgs,
        graphics = (point.graphics = point.graphics || []),
        startX = (shapeArgs?.x ?? 0) + ((shapeArgs?.width ?? 0) - slotsPerColumn * slotWidth + slotWidth) / 2;

      let x = startX,
        y = isNegative ? shapeArgs?.y ?? 0 : (shapeArgs?.y ?? 0) + (shapeArgs?.height ?? 0) - slotHeight,
        slotColumn = 0;

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
          attr.width = slotWidth;
          attr.height = slotHeight;
          graphic.animate(attr);
        } else {
          graphic = this.chart.renderer.rect(x, y, slotWidth, slotHeight).attr(attr).add(point.graphic);
        }
        graphic.isActive = true;
        graphics[val] = graphic;

        // Place dots inside the column, moving up the column
        // as it hits the slotPerColumn value
        x += slotWidth;
        slotColumn++;
        if (slotColumn >= slotsPerColumn) {
          slotColumn = 0;
          x = startX;
          y = isNegative ? y + slotHeight : y - slotHeight;
        }
      }
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
