#version 450

#extension GL_ARB_separate_shader_objects : enable
#extension GL_ARB_shading_language_420pack : enable

// We have exactly 15 materials/textures in the scene.
// This could use something like "layout (constant_id = 0) const uint materialCount = 1;" to specialize
// the material count at pipeline setup, but don't unnecessarily complicate things in here.
layout (set = 1, binding = 0) uniform texture2D textures[15];
layout (set = 1, binding = 1) uniform sampler samplers[15];

layout (location = 0) in vec3 inNormal;
layout (location = 1) in vec3 inColor;
layout (location = 2) in vec2 inUV;
layout (location = 3) in vec3 inViewVec;
layout (location = 4) in vec3 inLightVec;

layout(push_constant) uniform Material
{
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	float opacity;
	uint materialIdx;
} material;

layout (location = 0) out vec4 outFragColor;

void main()
{
	vec4 color = texture(sampler2D(textures[material.materialIdx], samplers[material.materialIdx]), inUV) * vec4(inColor, 1.0);
	vec3 N = normalize(inNormal);
	vec3 L = normalize(inLightVec);
	vec3 V = normalize(inViewVec);
	vec3 R = reflect(-L, N);
	vec3 diffuse = max(dot(N, L), 0.0) * material.diffuse.rgb;
	vec3 specular = pow(max(dot(R, V), 0.0), 16.0) * material.specular.rgb;
	outFragColor = vec4((material.ambient.rgb + diffuse) * color.rgb + specular, 1.0-material.opacity);
}
