import { G6Event, IG6GraphEvent, Item, ICombo, INode } from '@antv/g6-core';
declare const _default: {
    getDefaultCfg(): {
        enableDelegate: boolean;
        delegateStyle: {};
        onlyChangeComboSize: boolean;
        activeState: string;
        selectedState: string;
        enableStack: boolean;
    };
    getEvents(): {
        [x: string & {}]: string;
        click?: string;
        dblclick?: string;
        dragstart?: string;
        drag?: string;
        dragend?: string;
        dragenter?: string;
        dragleave?: string;
        dragover?: string;
        drop?: string;
        mousedown?: string;
        mouseenter?: string;
        mouseup?: string;
        mousemove?: string;
        mouseout?: string;
        mouseover?: string;
        mouseleave?: string;
        panmove?: string;
        panend?: string;
        touchstart?: string;
        touchmove?: string;
        touchend?: string;
        contextmenu?: string;
        "node:click"?: string;
        "node:dblclick"?: string;
        "node:dragstart"?: string;
        "node:drag"?: string;
        "node:dragend"?: string;
        "node:dragenter"?: string;
        "node:dragleave"?: string;
        "node:dragover"?: string;
        "node:drop"?: string;
        "node:mousedown"?: string;
        "node:mouseenter"?: string;
        "node:mouseup"?: string;
        "node:mousemove"?: string;
        "node:mouseout"?: string;
        "node:mouseover"?: string;
        "node:mouseleave"?: string;
        "node:panestart"?: string;
        "node:panmove"?: string;
        "node:panend"?: string;
        "node:touchstart"?: string;
        "node:touchmove"?: string;
        "node:touchend"?: string;
        "node:contextmenu"?: string;
        "edge:click"?: string;
        "edge:dblclick"?: string;
        "edge:dragstart"?: string;
        "edge:drag"?: string;
        "edge:dragend"?: string;
        "edge:dragenter"?: string;
        "edge:dragleave"?: string;
        "edge:dragover"?: string;
        "edge:mousedown"?: string;
        "edge:mouseenter"?: string;
        "edge:mouseup"?: string;
        "edge:mousemove"?: string;
        "edge:mouseout"?: string;
        "edge:mouseover"?: string;
        "edge:mouseleave"?: string;
        "edge:touchstart"?: string;
        "edge:touchmove"?: string;
        "edge:touchend"?: string;
        "edge:contextmenu"?: string;
        "combo:click"?: string;
        "combo:dblclick"?: string;
        "combo:dragstart"?: string;
        "combo:drag"?: string;
        "combo:dragend"?: string;
        "combo:dragenter"?: string;
        "combo:dragleave"?: string;
        "combo:dragover"?: string;
        "combo:drop"?: string;
        "combo:mousedown"?: string;
        "combo:mouseenter"?: string;
        "combo:mouseup"?: string;
        "combo:mousemove"?: string;
        "combo:mouseout"?: string;
        "combo:mouseover"?: string;
        "combo:mouseleave"?: string;
        "combo:panestart"?: string;
        "combo:panmove"?: string;
        "combo:panend"?: string;
        "combo:touchstart"?: string;
        "combo:touchmove"?: string;
        "combo:touchend"?: string;
        "combo:contextmenu"?: string;
        keydown?: string;
        keyup?: string;
        wheel?: string;
        "canvas:click"?: string;
        "canvas:dblclick"?: string;
        "canvas:dragstart"?: string;
        "canvas:drag"?: string;
        "canvas:dragend"?: string;
        "canvas:dragenter"?: string;
        "canvas:dragleave"?: string;
        "canvas:drop"?: string;
        "canvas:mousedown"?: string;
        "canvas:mouseenter"?: string;
        "canvas:mouseup"?: string;
        "canvas:mousemove"?: string;
        "canvas:mouseout"?: string;
        "canvas:mouseover"?: string;
        "canvas:mouseleave"?: string;
        "canvas:touchstart"?: string;
        "canvas:touchmove"?: string;
        "canvas:touchend"?: string;
        "canvas:contextmenu"?: string;
        "canvas:keydown"?: string;
        "canvas:keyup"?: string;
        "canvas:wheel"?: string;
        beforerender?: string;
        afterrender?: string;
        beforeadditem?: string;
        afteradditem?: string;
        beforeremoveitem?: string;
        afterremoveitem?: string;
        beforeupdateitem?: string;
        afterupdateitem?: string;
        beforeitemvisibilitychange?: string;
        afteritemvisibilitychange?: string;
        beforeitemstatechange?: string;
        afteritemstatechange?: string;
        beforeitemrefresh?: string;
        afteritemrefresh?: string;
        beforeitemstatesclear?: string;
        afteritemstatesclear?: string;
        beforemodechange?: string;
        aftermodechange?: string;
        beforelayout?: string;
        afterlayout?: string;
        beforegraphrefreshposition?: string;
        aftergraphrefreshposition?: string;
        beforegraphrefresh?: string;
        aftergraphrefresh?: string;
        beforeanimate?: string;
        afteranimate?: string;
        beforecreateedge?: string;
        aftercreateedge?: string;
        beforecollapseexpandcombo?: string;
        aftercollapseexpandcombo?: string;
        graphstatechange?: string;
        afteractivaterelations?: string;
        nodeselectchange?: string;
        itemcollapsed?: string;
        tooltipchange?: string;
        wheelzoom?: string;
        viewportchange?: string;
        dragnodeend?: string;
        stackchange?: string;
        beforepaint?: string;
        afterpaint?: string;
        tap?: string;
        pinchstart?: string;
        pinmove?: string;
        panstart?: string;
        dragout?: string;
        focus?: string;
        blur?: string;
    };
    validationCombo(evt: IG6GraphEvent): boolean;
    onDragStart(evt: IG6GraphEvent): void;
    onDrag(evt: IG6GraphEvent): void;
    updatePositions(evt: IG6GraphEvent, restore: boolean): void;
    onDrop(evt: IG6GraphEvent): void;
    onNodeDrop(evt: IG6GraphEvent): void;
    onDragEnter(evt: IG6GraphEvent): void;
    onDragLeave(evt: any): void;
    onDragEnd(evt: IG6GraphEvent): void;
    end(comboDropedOn: ICombo | undefined, evt: IG6GraphEvent): void;
    /**
     * 遍历 comboTree，分别更新 node 和 combo
     * @param data
     * @param fn
     */
    traverse<T extends Item>(data: T, fn: (param: T, cacheMap: any) => boolean, edgesToBeUpdate?: {}): void;
    updateCombo(item: ICombo, evt: IG6GraphEvent, restore: boolean): void;
    /**
     *
     * @param item 当前正在拖动的元素
     * @param evt
     */
    updateSingleItem(item: INode | ICombo, evt: IG6GraphEvent, restore: boolean): void;
    /**
     * 根据 ID 获取父 Combo
     * @param parentId 父 Combo ID
     */
    getParentCombo(parentId: string): ICombo | undefined;
    updateDelegate(evt: IG6GraphEvent): void;
    /**
     * updates the parent combos' size and position
     */
    updateParentCombos(): void;
};
export default _default;
