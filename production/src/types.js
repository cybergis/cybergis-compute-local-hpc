"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slurm_string_option_configs = exports.slurm_integer_none_unit_config = exports.slurm_integer_time_unit_config = exports.slurm_integer_storage_unit_config = exports.slurm_integer_configs = exports.slurm_configs = void 0;
exports.slurm_configs = ['num_of_node', 'num_of_task', 'time', 'cpu_per_task', 'memory_per_cpu', 'memory_per_gpu', 'memory', 'gpus', 'gpus_per_node', 'gpus_per_socket', 'gpus_per_task', 'partition'];
exports.slurm_integer_configs = ['num_of_node', 'num_of_task', 'time', 'cpu_per_task', 'memory_per_cpu', 'memory_per_gpu', 'memory', 'gpus', 'gpus_per_node', 'gpus_per_socket', 'gpus_per_task'];
exports.slurm_integer_storage_unit_config = ['memory_per_cpu', 'memory_per_gpu', 'memory'];
exports.slurm_integer_time_unit_config = ['time'];
exports.slurm_integer_none_unit_config = ['cpu_per_task', 'num_of_node', 'num_of_task', 'gpus', 'gpus_per_node', 'gpus_per_socket', 'gpus_per_task'];
exports.slurm_string_option_configs = ['partition'];
