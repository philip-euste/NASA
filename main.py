import httpx
import xml.etree.ElementTree as ET
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Marswalk API")


MARS_GLOBAL_LAYER = {
    "id": "mars_global_mola",
    "name": "MGS MOLA, Global Color Hillshade",
    "source": "NASA Mars Trek",
    "layer_id": "Mars_MGS_MOLA_ClrShade_merge_global_463m",
    "data_type": "imagery",
    "description": "Global Mars color hillshade map",
}


JEZERO_LAYER = {
    "id": "jezero_hirise",
    "name": "Jezero Crater HiRISE Mosaic",
    "source": "NASA Mars Trek",
    "layer_id": (
        "JEZ_hirise_soc_006_orthoMosaic_25cm_"
        "Eqc_latTs0_lon0_first_dd"
    ),
    "data_type": "imagery",
    "description": "High-resolution orbital imagery of Jezero Crater",
}


def get_capabilities_url(layer):
    return (
        "https://trek.nasa.gov/tiles/Mars/EQ/"
        f"{layer['layer_id']}/1.0.0/"
        "WMTSCapabilities.xml"
    )

@app.get("/")
def home():
    return {"message": "Marswalk API is running!"}


@app.get("/api/layers")
def get_layers():
    return [MARS_GLOBAL_LAYER, JEZERO_LAYER]


@app.get("/api/layers/{layer_id}")
def get_layer(layer_id: str):
    for layer in [MARS_GLOBAL_LAYER, JEZERO_LAYER]:
        if layer["id"] == layer_id:
            return layer

    raise HTTPException(
        status_code=404,
        detail="Layer not found",
    )

@app.get("/api/nasa/layers/{layer_id}/capabilities")
async def get_nasa_capabilities(layer_id: str):
    catalog = [MARS_GLOBAL_LAYER, JEZERO_LAYER]

    layer = next(
        (item for item in catalog if item["id"] == layer_id),
        None,
    )

    if layer is None:
        raise HTTPException(
            status_code=404,
            detail="Layer not found",
        )

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                get_capabilities_url(layer)
            )
            response.raise_for_status()

        return {
            "source": layer["source"],
            "status": "connected",
            "content_type": response.headers.get("content-type"),
            "capabilities_xml": response.text,
        }

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"NASA service request failed: {error}",
        )



@app.get("/api/nasa/layers/{layer_id}/info")
async def get_layer_info(layer_id: str):
    catalog = [MARS_GLOBAL_LAYER, JEZERO_LAYER]

    layer_config = next(
        (item for item in catalog if item["id"] == layer_id),
        None,
    )

    if layer_config is None:
        raise HTTPException(
            status_code=404,
            detail="Layer not found",
        )

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                get_capabilities_url(layer_config)
            )
            response.raise_for_status()

        root = ET.fromstring(response.content)

        def find_all(element, tag_name):
            return [
                node for node in element.iter()
                if node.tag.split("}")[-1] == tag_name
            ]

        target_id = layer_config["layer_id"]

        layer = next(
            (
                item for item in find_all(root, "Layer")
                if any(
                    node.text == target_id
                    for node in find_all(item, "Identifier")
                )
            ),
            None,
        )

        if layer is None:
            raise HTTPException(
                status_code=404,
                detail="Layer not found in NASA capabilities",
            )

        return {
            "id": layer_config["id"],
            "name": layer_config["name"],
            "layer_id": target_id,
            "formats": [
                node.text for node in find_all(layer, "Format")
                if node.text
            ],
            "tile_resources": [
                {
                    "format": item.get("format"),
                    "resource_type": item.get("resourceType"),
                    "template": item.get("template"),
                }
                for item in find_all(layer, "ResourceURL")
            ],
            "tile_matrix_sets": [
                node.text
                for node in find_all(layer, "TileMatrixSet")
                if node.text
            ],
        }

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"NASA request failed: {error}",
        )
    except ET.ParseError:
        raise HTTPException(
            status_code=502,
            detail="NASA returned invalid XML",
        )



@app.get("/api/nasa/layers/{layer_id}/tile-config")
async def get_tile_config(layer_id: str):
    info = await get_layer_info(layer_id)

    tile = next(
        (
            resource
            for resource in info["tile_resources"]
            if resource["resource_type"] == "tile"
        ),
        None,
    )

    if tile is None:
        raise HTTPException(
            status_code=404,
            detail="No tile template found for this layer",
        )

    return {
        "id": info["id"],
        "layer_id": info["layer_id"],
        "format": tile["format"],
        "tile_matrix_sets": info["tile_matrix_sets"],
        "tile_url_template": tile["template"],
    }


