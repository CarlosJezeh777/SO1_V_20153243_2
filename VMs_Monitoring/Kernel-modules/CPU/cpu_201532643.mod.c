#include <linux/module.h>
#define INCLUDE_VERMAGIC
#include <linux/build-salt.h>
#include <linux/elfnote-lto.h>
#include <linux/export-internal.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

#ifdef CONFIG_UNWINDER_ORC
#include <asm/orc_header.h>
ORC_HEADER;
#endif

BUILD_SALT;
BUILD_LTO_INFO;

MODULE_INFO(vermagic, VERMAGIC_STRING);
MODULE_INFO(name, KBUILD_MODNAME);

__visible struct module __this_module
__section(".gnu.linkonce.this_module") = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

#ifdef CONFIG_RETPOLINE
MODULE_INFO(retpoline, "Y");
#endif



static const struct modversion_info ____versions[]
__used __section("__versions") = {
	{ 0xd427b70e, "single_open" },
	{ 0x18833192, "filp_open" },
	{ 0x5eaea17e, "kernel_read" },
	{ 0xbcab6ee6, "sscanf" },
	{ 0x2d42b731, "filp_close" },
	{ 0xf0fdf6cb, "__stack_chk_fail" },
	{ 0xced2c048, "remove_proc_entry" },
	{ 0xb6400c9b, "seq_printf" },
	{ 0xd7df0b90, "init_task" },
	{ 0xb997da3e, "seq_read" },
	{ 0xbdfb6dbb, "__fentry__" },
	{ 0xec0bd42d, "proc_create" },
	{ 0x122c3a7e, "_printk" },
	{ 0x5b8239ca, "__x86_return_thunk" },
	{ 0xf079b8f9, "module_layout" },
};

MODULE_INFO(depends, "");


MODULE_INFO(srcversion, "7741BB54D0E353E182FAA5C");
