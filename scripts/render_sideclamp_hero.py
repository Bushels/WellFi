import argparse
import math
import os

import bpy
from mathutils import Vector


def parse_args() -> argparse.Namespace:
    argv = []
    if "--" in os.sys.argv:
        argv = os.sys.argv[os.sys.argv.index("--") + 1 :]

    parser = argparse.ArgumentParser(description="Render the WellFi side-clamp hero asset.")
    parser.add_argument("--model", required=True, help="Path to the side-clamp GLB model.")
    parser.add_argument("--output", required=True, help="Output PNG path.")
    parser.add_argument("--width", type=int, default=2000)
    parser.add_argument("--height", type=int, default=6000)
    parser.add_argument("--samples", type=int, default=256)
    return parser.parse_args(argv)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)
    for block in bpy.data.images:
        if block.users == 0:
            bpy.data.images.remove(block)


def world_bounds(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    bpy.context.view_layer.update()
    world_corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]

    min_corner = Vector(
        (
            min(point.x for point in world_corners),
            min(point.y for point in world_corners),
            min(point.z for point in world_corners),
        )
    )
    max_corner = Vector(
        (
            max(point.x for point in world_corners),
            max(point.y for point in world_corners),
            max(point.z for point in world_corners),
        )
    )
    return min_corner, max_corner


def add_area_light(
    name: str,
    location: tuple[float, float, float],
    rotation: tuple[float, float, float],
    energy: float,
    size: float,
    size_y: float,
    color: tuple[float, float, float],
) -> None:
    light_data = bpy.data.lights.new(name=name, type="AREA")
    light_data.shape = "RECTANGLE"
    light_data.energy = energy
    light_data.size = size
    light_data.size_y = size_y
    light_data.color = color
    light_obj = bpy.data.objects.new(name, light_data)
    light_obj.location = location
    light_obj.rotation_euler = rotation
    bpy.context.collection.objects.link(light_obj)


def configure_scene(scene: bpy.types.Scene, width: int, height: int, samples: int) -> None:
    scene.render.engine = "CYCLES"
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100

    scene.cycles.samples = samples
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.adaptive_threshold = 0.01
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = "OPENIMAGEDENOISE"

    preferences = bpy.context.preferences.addons["cycles"].preferences
    if preferences.has_active_device():
        scene.cycles.device = "GPU"
        try:
            preferences.compute_device_type = "CUDA"
        except TypeError:
            pass
    else:
        scene.cycles.device = "CPU"

    scene.display_settings.display_device = "sRGB"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - High Contrast"

    if scene.world is None:
        scene.world = bpy.data.worlds.new("HeroWorld")
    scene.world.color = (0.01, 0.01, 0.012)


def main() -> None:
    args = parse_args()
    output_dir = os.path.dirname(args.output)
    os.makedirs(output_dir, exist_ok=True)

    clear_scene()
    configure_scene(bpy.context.scene, args.width, args.height, args.samples)

    bpy.ops.import_scene.gltf(filepath=args.model)

    mesh_objects = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    if not mesh_objects:
        raise RuntimeError("No meshes imported from GLB.")

    root = mesh_objects[0]
    root.name = "WellFiSideClamp"

    min_corner, max_corner = world_bounds(root)
    center = (min_corner + max_corner) * 0.5
    root.location -= Vector((center.x, center.y, center.z))

    bpy.context.view_layer.update()
    min_corner, max_corner = world_bounds(root)
    height = max_corner.z - min_corner.z

    camera_data = bpy.data.cameras.new("HeroCamera")
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = 172.0
    camera = bpy.data.objects.new("HeroCamera", camera_data)
    camera.location = (-760.0, 0.0, 0.0)
    look_direction = Vector((0.0, 0.0, 0.0)) - camera.location
    camera.rotation_euler = look_direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera

    add_area_light(
        name="HeroKey",
        location=(-360.0, -220.0, 70.0),
        rotation=(math.radians(76), 0.0, math.radians(-108)),
        energy=16000.0,
        size=540.0,
        size_y=88.0,
        color=(1.0, 1.0, 1.0),
    )
    add_area_light(
        name="HeroFill",
        location=(-280.0, 190.0, -80.0),
        rotation=(math.radians(82), 0.0, math.radians(104)),
        energy=5200.0,
        size=420.0,
        size_y=120.0,
        color=(0.93, 0.96, 1.0),
    )
    add_area_light(
        name="HeroTop",
        location=(0.0, -240.0, 360.0),
        rotation=(math.radians(90), 0.0, 0.0),
        energy=7800.0,
        size=300.0,
        size_y=120.0,
        color=(1.0, 1.0, 1.0),
    )
    add_area_light(
        name="HeroRim",
        location=(210.0, 240.0, 120.0),
        rotation=(math.radians(95), 0.0, math.radians(90)),
        energy=10200.0,
        size=380.0,
        size_y=56.0,
        color=(0.98, 0.99, 1.0),
    )

    padding = 1.08
    visible_height = camera_data.ortho_scale * (args.height / args.width)
    if height > visible_height:
        camera_data.ortho_scale = (height * padding) / (args.height / args.width)

    bpy.context.scene.render.filepath = args.output
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
