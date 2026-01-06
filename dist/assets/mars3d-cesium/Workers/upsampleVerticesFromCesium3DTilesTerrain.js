/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.136.0
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import{a as f}from"./chunk-EBRPXF46.js";import"./chunk-CM4ICROJ.js";import"./chunk-QGOLNSX2.js";import{a as u}from"./chunk-YEN6SY2C.js";import"./chunk-DCJBRXQ3.js";import"./chunk-DCAJW75L.js";import"./chunk-I6TRDB5O.js";import"./chunk-UHYWWDIG.js";import"./chunk-VDPN3SFE.js";import"./chunk-VA2HZUHQ.js";import"./chunk-LOOC34UL.js";import"./chunk-AZECGCLU.js";import"./chunk-WNFYYD3I.js";import"./chunk-OREI43PJ.js";import"./chunk-4GQTSTSF.js";import"./chunk-HDT6ASXB.js";import"./chunk-V4GKMAF3.js";import"./chunk-I2OJC4V7.js";import"./chunk-KYKVWXMG.js";import"./chunk-JSRVU52I.js";import"./chunk-BCEL3FDA.js";import"./chunk-TEPAYIZU.js";import"./chunk-WT2QAEEE.js";import"./chunk-5ZPZOULN.js";function h(c,d){let e=f.upsampleMesh(c),t=e.vertices.buffer,i=e.indices.buffer,s=e.westIndicesSouthToNorth.buffer,o=e.southIndicesEastToWest.buffer,r=e.eastIndicesNorthToSouth.buffer,n=e.northIndicesWestToEast.buffer;return d.push(t,i,s,o,r,n),{verticesBuffer:t,indicesBuffer:i,vertexCountWithoutSkirts:e.vertexCountWithoutSkirts,indexCountWithoutSkirts:e.indexCountWithoutSkirts,encoding:e.encoding,westIndicesBuffer:s,southIndicesBuffer:o,eastIndicesBuffer:r,northIndicesBuffer:n,minimumHeight:e.minimumHeight,maximumHeight:e.maximumHeight,boundingSphere:e.boundingSphere3D,orientedBoundingBox:e.orientedBoundingBox,horizonOcclusionPoint:e.horizonOcclusionPoint}}var I=u(h);export{I as default};
