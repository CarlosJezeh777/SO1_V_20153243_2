#include <linux/module.h>
// Necesario para todos los modulos
#include <linux/kernel.h>
// Para usar el kern_info
#include <linux/init.h>
// header para los macros de inicializacion y limpieza
#include <linux/proc_fs.h>
// Para usar las funciones de procfs
#include <asm/uaccess.h>
// Para usar las funciones de copia de datos entre espacio de usuario y espacio de kernel
#include <linux/seq_file.h>
// Para usar las funciones de seq_file
#include <linux/mm.h>
// Para usar las funciones de memoria
#include <linux/sysinfo.h>
// Para usar la estructura sysinfo

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Carlos Toscano");
MODULE_DESCRIPTION("Modulo de monitoreo de RAM");
MODULE_VERSION("1.0");

static int escribir_archivo(struct seq_file * archivo, void *v) {
    struct sysinfo info;
    // Variables para almacenar la informacion de la memoria
    long total_ram, free_ram, used_ram, percentage_used;
    // Variables para almacenar la informacion de la memoria
    si_meminfo(&info);
    // Obtenemos la informacion de la memoria
    total_ram = (info.totalram * info.mem_unit) / (1024 * 1024);
    // Convertimos la informacion de la memoria a MB
    free_ram = (info.freeram * info.mem_unit) / (1024 * 1024);
    used_ram = total_ram - free_ram;
    percentage_used = (used_ram * 100) / total_ram;
    // Calculamos la cantidad de memoria usada y el porcentaje de memoria usada
    seq_printf(archivo, "{\n");
    seq_printf(archivo, "\"total_ram\": %ld,\n", total_ram);
    seq_printf(archivo, "\"free_ram\": %ld,\n", free_ram);
    seq_printf(archivo, "\"used_ram\": %ld,\n", used_ram);
    seq_printf(archivo, "\"percentage_used\": %ld\n", percentage_used);
    seq_printf(archivo, "}\n");
    // Escribimos la informacion en el archivo
    return 0;
}

static int al_abrir(struct inode *inode, struct file *file) {
    return single_open(file, escribir_archivo, NULL);
}

static struct proc_ops operaciones = {
    .proc_open = al_abrir,
    .proc_read = seq_read
};

static int _insert(void){
    proc_create("ram", 0, NULL, &operaciones);
    printk(KERN_INFO "Creando el archivo /proc/ram_201532643");
    return 0;
}

static void _delete(void){
    remove_proc_entry("ram", NULL);
    printk(KERN_INFO "Eliminando el archivo /proc/ram_201532643");
}

module_init(_insert);
module_exit(_delete);