import { Response } from "express";
import { CallbackError, Mongoose } from "mongoose";
const mongoose = require("mongoose");
// import { nanoid } from 'nanoid';
import { customAlphabet } from "nanoid";
import { environmnet } from "../environment/environment";

import moment from "moment";
moment.locale("es");

// Modelo
import pedidoModel from "../models/pedidoModel";
import workerModel from "../models/workerModel";

// Interface
import { PedidoModelInterface } from "../interfaces/pedidos";

// Clases
// import { BitacoraClass } from './bitacoraClass';

// Funciones
// import { castEstado, castITBMS } from '../functions/castEstado';
import Server from "./server";

export class PedidosClass {
  private idRef: any;
  private pathIds = `pedidosIDs.json`;

  constructor() {
    // this.idRef = nanoid(10);
    this.idRef = customAlphabet("1234567890", 6);
  }

  crearPedido(req: any, resp: Response): void {
    const idCreador = req.usuario._id;
    // const idReferencia = this.idRef;
    const idReferencia = this.idRef();
    const fecha_alta = moment().format("YYYY-MM-DD");
    // const fecha_alta = moment().format('2021-04-15');
    // const fecha_entrega = moment().add(3, 'days').format('YYYY-MM-DD');
    const fecha_entrega = req.body.fecha_entrega;
    const cliente = req.get("cliente");
    const sucursal = req.get("sucursal");
    const vendedor = req.get("vendedor");
    // const origenPedido = req.get('origen');

    const crearPedido = () => {
      const crearNuevoPedido = new pedidoModel({
        idCreador: idCreador,
        idReferencia: idReferencia,
        fecha_alta: fecha_alta,
        fecha_entrega: fecha_entrega,
        cliente: cliente,
        sucursal: sucursal,
        // asignado_a: vendedor
        // origen_pedido: origenPedido
      });

      crearNuevoPedido.save(
        async (err: CallbackError, pedidoDB: PedidoModelInterface) => {
          if (err) {
            return resp.json({
              ok: false,
              mensaje: `Error interno`,
              err,
            });
          }

          return resp.json({
            ok: true,
            mensaje: `Pedido creado`,
            pedidoDB,
          });
        }
      );
    };

    pedidoModel.find(
      { cliente: cliente },
      (err: any, pedidosDB: Array<PedidoModelInterface>) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (pedidosDB.length === 0) {
          crearPedido();
        } else {
          const hayPendientes = pedidosDB.find(
            (pedido) => pedido.etapa_pedido === 0
          );

          if (hayPendientes) {
            // console.log('hay pendientes');
            return resp.json({
              ok: false,
              mensaje: `Este cliente tiene pedidos pendientes`,
            });
          } else {
            // console.log('no hay pendientes');
            crearPedido();
          }
        }
      }
    );
  }

  async editarPedido(req: any, resp: Response): Promise<any> {
    // cargar los usuarios workers de la sucursal del pedido
    // todas las bandeja de produccion tienen la etapa produccion
    // todo va guardado basado en la sucursal

    const tipo: string = req.body.tipo;
    const id = new mongoose.Types.ObjectId(req.get("id"));
    const sucursal = req.body.sucursal;
    const etapa_pedido = Number(req.body.etapa_pedido);
    const prioridad_pedido = req.body.prioridad_pedido;
    const asignado_a = req.body.asignado_a;
    const estado_pedido = req.body.estado_pedido;
    const origen_pedido = req.body.origen_pedido;
    const fecha_entrega = req.body.fecha_entrega;
    const itbms = req.body.itbms;
    const subtotal = Number(req.body.subtotal);
    const total = Number(req.body.total);

    const actualizarInfo = async () => {
      const query = {
        fecha_entrega: fecha_entrega,
        prioridad_pedido: prioridad_pedido,
        etapa_pedido: etapa_pedido,
        asignado_a: asignado_a,
        estado_pedido: estado_pedido,
        origen_pedido: origen_pedido,
        sucursal: sucursal,
      };

      const pedidoDB: any = await pedidoModel
        .findById(id)
        .populate("sucursal")
        .populate("asignado_a")
        .populate("origen_pedido")
        .populate("productos_pedidos")
        .populate("pagos_pedido")
        .exec();

      if (!query.fecha_entrega) {
        query.fecha_entrega = pedidoDB.fecha_entrega;
      }

      if (!query.prioridad_pedido) {
        query.prioridad_pedido = pedidoDB.prioridad_pedido;
      }

      if (isNaN(query.etapa_pedido)) {
        query.etapa_pedido = pedidoDB.etapa_pedido;
      }

      if (!query.estado_pedido) {
        query.estado_pedido = pedidoDB.estado_pedido;
      }

      if (!query.origen_pedido) {
        query.origen_pedido = pedidoDB.origen_pedido;
      }

      if (!query.sucursal) {
        query.sucursal = pedidoDB.sucursal;
      }

      if (query.asignado_a === "null") {
        // query.asignado_a = null;
        query.asignado_a = pedidoDB.asignado_a;
      }

      const actualizarPedido = () => {
        pedidoModel
          .findByIdAndUpdate(id, query, { new: true })
          .populate("sucursal")
          // .populate('etapa_pedido')
          // .populate('prioridad_pedido')
          .populate("asignado_a")
          .populate("origen_pedido")
          .populate("productos_pedidos")
          .populate("pagos_pedido")
          .exec(
            async (
              err: CallbackError,
              pedidoDB: PedidoModelInterface | any
            ) => {
              if (err) {
                return resp.json({
                  ok: false,
                  mensaje: `Error interno`,
                  err,
                });
              }

              // if (query.sucursal) {
              //     await bitacora.crearBitacora(req, `Cambió sucursal del pedido a ${pedidoDB.sucursal.nombre}`, pedidoDB._id);
              // }

              // if (query.etapa_pedido) {
              //     await bitacora.crearBitacora(req, `Cambió etapa del pedido a ${pedidoDB.etapa_pedido.nombre}`, pedidoDB._id);
              // }

              // if (query.prioridad_pedido) {
              //     await bitacora.crearBitacora(req, `Cambió la prioridad del pedido a ${pedidoDB.prioridad_pedido.nombre}`, pedidoDB._id);
              // }

              // if (query.asignado_a) {
              //     await bitacora.crearBitacora(req, `Asginó el pedido a ${pedidoDB.asignado_a.nombre}`, pedidoDB._id);
              // }

              // if (query.estado_pedido) {
              //     await bitacora.crearBitacora(req, `Cambió el estado del pedido a ${pedidoDB.estado_pedido}`, pedidoDB._id);
              // }

              return resp.json({
                ok: true,
                mensaje: "Pedido actualizado",
                pedidoDB,
                // pedidoDB: pedidoDB
              });
            }
          );
      };

      actualizarPedido();

      // const idWorker = new mongoose.Types.ObjectId(query.asignado_a);

      // if (
      //   (pedidoDB.asginado_a === null && query.asignado_a === null) ||
      //   (pedidoDB.asginado_a !== null && query.asignado_a === null)
      // ) {
      //   // console.log("Opcion No. 1 y 2");
      //   actualizarPedido();
      //   workerModel.updateMany(
      //     {},
      //     { $pull: { pedidos: { $in: [id] } } },
      //     {},
      //     (err: any, asignadoDB: any) => {
      //       if (err) {
      //         return resp.json({
      //           ok: false,
      //           mensaje: "Error interno",
      //           err,
      //         });
      //       } else {
      //         actualizarPedido();
      //       }
      //     }
      //   );
      // } else if (
      //   (pedidoDB.asignado_a === null && query.asignado_a !== null) ||
      //   (pedidoDB.asginado_a !== null && query.asignado_a !== null)
      // ) {
      //   // console.log('Opcion No. 3 y 4');
      //   // actualizarPedido();
      //   workerModel.updateMany(
      //     {},
      //     { $pull: { pedidos: { $in: [id] } } },
      //     {},
      //     (err: any, asignadoDB: any) => {
      //       if (err) {
      //         return resp.json({
      //           ok: false,
      //           mensaje: "Error interno",
      //           err,
      //         });
      //       } else {
      //         workerModel.findByIdAndUpdate(
      //           idWorker,
      //           { $push: { pedidos: id } },
      //           (err: any, asignadoDB: any) => {
      //             if (err) {
      //               return resp.json({
      //                 ok: false,
      //                 mensaje: "Error interno",
      //                 err,
      //               });
      //             } else {
      //               actualizarPedido();
      //             }
      //           }
      //         );
      //       }
      //     }
      //   );
      // }
    };

    const actualizarGeneral = async () => {
      const query = {
        fecha_entrega: fecha_entrega,
        prioridad_pedido: prioridad_pedido,
        etapa_pedido: etapa_pedido,
        asignado_a: asignado_a,
        estado_pedido: estado_pedido,
        origen_pedido: origen_pedido,
        sucursal: sucursal,
        itbms: itbms,
        subtotal,
        total,
      };

      const pedidoDB: any = await pedidoModel
        .findById(id)
        .populate("sucursal")
        .populate("asignado_a")
        .populate("origen_pedido")
        .populate("productos_pedidos")
        .populate("pagos_pedido")
        .exec();

      if (!query.fecha_entrega) {
        query.fecha_entrega = pedidoDB.fecha_entrega;
      }

      if (!query.prioridad_pedido) {
        query.prioridad_pedido = pedidoDB.prioridad_pedido;
      }

      if (isNaN(query.etapa_pedido)) {
        query.etapa_pedido = pedidoDB.etapa_pedido;
      }

      if (!query.estado_pedido) {
        query.estado_pedido = pedidoDB.estado_pedido;
      }

      if (!query.origen_pedido) {
        query.origen_pedido = pedidoDB.origen_pedido;
      }

      if (!query.sucursal) {
        query.sucursal = pedidoDB.sucursal;
      }

      if (!query.asignado_a) {
        query.asignado_a = pedidoDB.asignado_a;
      }

      if (isNaN(subtotal)) {
        query.subtotal = pedidoDB.subtotal;
      }

      if (isNaN(total)) {
        query.total = pedidoDB.total;
      }

      if (query.itbms === undefined) {
        query.itbms = pedidoDB.itbms;
      }

      pedidoModel
        .findByIdAndUpdate(id, query, { new: true })
        .populate("sucursal")
        .populate("asignado_a")
        .populate("origen_pedido")
        .populate("productos_pedidos")
        .populate("pagos_pedido")
        .exec(
          async (err: CallbackError, pedidoDB: PedidoModelInterface | any) => {
            if (err) {
              return resp.json({
                ok: false,
                mensaje: `Error interno`,
                err,
              });
            }

            // if (query.sucursal) {
            //     await bitacora.crearBitacora(req, `Cambió sucursal del pedido a ${pedidoDB.sucursal.nombre}`, pedidoDB._id);
            // }

            // if (query.etapa_pedido) {
            //     await bitacora.crearBitacora(req, `Cambió etapa del pedido a ${pedidoDB.etapa_pedido.nombre}`, pedidoDB._id);
            // }

            // if (query.prioridad_pedido) {
            //     await bitacora.crearBitacora(req, `Cambió la prioridad del pedido a ${pedidoDB.prioridad_pedido.nombre}`, pedidoDB._id);
            // }

            // if (query.asignado_a) {
            //     await bitacora.crearBitacora(req, `Asginó el pedido a ${pedidoDB.asignado_a.nombre}`, pedidoDB._id);
            // }

            // if (query.estado_pedido) {
            //     await bitacora.crearBitacora(req, `Cambió el estado del pedido a ${pedidoDB.estado_pedido}`, pedidoDB._id);
            // }

            return resp.json({
              ok: true,
              mensaje: "Pedido actualizado",
              pedidoDB,
              // pedidoDB: pedidoDB
            });
          }
        );
    };

    const actualizarProducto = async () => {
      const pedidoDB: any = await pedidoModel
        .findById(id)
        .populate("sucursal")
        .populate("asignado_a")
        .populate("origen_pedido")
        .populate("productos_pedidos")
        .populate("pagos_pedido")
        .exec();

      const query = {
        itbms: itbms,
        subtotal,
        total,
      };

      if (isNaN(subtotal)) {
        query.subtotal = pedidoDB.subtotal;
      }

      if (isNaN(total)) {
        query.total = pedidoDB.total;
      }

      if (query.itbms === undefined) {
        query.itbms = pedidoDB.itbms;
      }

      pedidoModel
        .findByIdAndUpdate(id, query, { new: true })
        .populate("sucursal")
        .populate("asignado_a")
        .populate("origen_pedido")
        .populate("productos_pedidos")
        .populate("pagos_pedido")
        .exec(
          async (err: CallbackError, pedidoDB: PedidoModelInterface | any) => {
            if (err) {
              return resp.json({
                ok: false,
                mensaje: `Error interno`,
                err,
              });
            }

            // if (query.sucursal) {
            //     await bitacora.crearBitacora(req, `Cambió sucursal del pedido a ${pedidoDB.sucursal.nombre}`, pedidoDB._id);
            // }

            // if (query.etapa_pedido) {
            //     await bitacora.crearBitacora(req, `Cambió etapa del pedido a ${pedidoDB.etapa_pedido.nombre}`, pedidoDB._id);
            // }

            // if (query.prioridad_pedido) {
            //     await bitacora.crearBitacora(req, `Cambió la prioridad del pedido a ${pedidoDB.prioridad_pedido.nombre}`, pedidoDB._id);
            // }

            // if (query.asignado_a) {
            //     await bitacora.crearBitacora(req, `Asginó el pedido a ${pedidoDB.asignado_a.nombre}`, pedidoDB._id);
            // }

            // if (query.estado_pedido) {
            //     await bitacora.crearBitacora(req, `Cambió el estado del pedido a ${pedidoDB.estado_pedido}`, pedidoDB._id);
            // }

            return resp.json({
              ok: true,
              mensaje: "Pedido actualizado",
              pedidoDB,
              // pedidoDB: pedidoDB
            });
          }
        );
    };

    // console.log(tipo);

    switch (tipo) {
      case "info":
        actualizarInfo();
        break;
      case "general":
        actualizarGeneral();
        break;
      case "producto":
        actualizarProducto();
        break;
    }
  }

  obtenerPedidoID(req: any, resp: Response): void {
    const id = req.get("id") || req.get("pedido");

    pedidoModel
      .findById(id)
      .populate("idCreador", "nombre apellido colaborador_role")
      .populate({
        path: "archivos",
        populate: { path: "idCreador", select: "nombre" },
      })
      // .populate('etapa_pedido', 'nombre')
      // .populate('prioridad_pedido', 'nombre color_prioridad')
      // .populate({ path: 'productos_pedidos', populate: { path: 'producto' } })
      .populate({ path: "productos_pedidos", populate: { path: "producto" } })
      .populate("pagos_pedido")
      .populate("cliente")
      .populate("asignado_a")
      .populate("sucursal")
      .populate("origen_pedido")
      .exec((err: CallbackError, pedidoDB: any) => {
        // console.log(err)

        if (err) {
          console.log(err);
          return resp.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!pedidoDB) {
          return resp.json({
            ok: false,
            mensaje: `No se encontró un pedido con ese ID`,
          });
        }

        // const server = Server.instance;
        // server.io.emit('recibir-pagos', {ok: true, pedidoDB: pedidoDB});

        return resp.json({
          ok: true,
          mensaje: `Pedidos Ok`,
          pedidoDB,
        });
      });
  }

  eliminarPedidoID(req: any, resp: Response): void {
    const id = req.get("id");

    pedidoModel
      .findByIdAndDelete(id)
      .exec(async (err: CallbackError, pedidoDB: any) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!pedidoDB) {
          return resp.json({
            ok: false,
            mensaje: `No se encontró un pedido`,
          });
        }

        return resp.json({
          ok: true,
          pedidoDB,
        });
      });
  }

  async obtenerPedidosPorRole(req: any, resp: Response): Promise<any> {
    const role = req.get("role");
    const idSucursalWorker = req.get("idSucursalWorker");
    const idUsuario = req.get("idUsuario");
    // const page = Number(req.get("page"));
    // const hasta: number = page * 5 || 5;

    const match = {
      $match: {},
    };

    // if (
    //   role === environmnet.colRole.SuperRole ||
    //   role === environmnet.colRole.AdminRole
    // ) {
    //   match.$match;
    // }

    if (
      role === environmnet.colRole.VendedorNormalRole ||
      role === environmnet.colRole.VendedorVIPRole
    ) {
      match.$match = {
        // sucursal: new mongoose.Types.ObjectId(idSucursalWorker),
        idCreador: new mongoose.Types.ObjectId(req.usuario._id),
      };
    }

    if (role === environmnet.colRole.produccionNormal) {
      match.$match = {
        $and: [
          { sucursal: new mongoose.Types.ObjectId(idSucursalWorker) },
          { etapa_pedido: 2 },
        ],
      };
    }

    if (role === environmnet.colRole.produccionVIP) {
      match.$match = { etapa_pedido: 2 };
    }

    if (
      role === environmnet.colRole.DiseniadorRole ||
      role === environmnet.colRole.DiseniadorVIPRole
    ) {
      match.$match = {
        $and: [
          { etapa_pedido: 1 },
          { "AsignadoA._id": new mongoose.Types.ObjectId(idUsuario) },
        ],
      };
    }

    // for (let i = 0; i < 3; i++) {
    //   console.log(i);
    // }
    Object.assign(match.$match, {
      $or: [{ etapa_pedido: 0 }, { etapa_pedido: 1 }, { etapa_pedido: 2 }],
    });

    const pedidosDB: any = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },
      match,
      {
        $sort: { etapa_pedido: 1, prioridad_pedido: 1, fecha_actual: 1 }, // prioridad_pedido: 1, fecha_actual: 1
      },
      // {
      //   $facet: {
      //     metadata: [{ $count: "total" }],
      //     data: [{ $limit: hasta }],
      //   },
      // },
      // {
      //   $limit: hasta, // hasta
      // },
      // {
      //   $skip: desde, // desde
      // },
      {
        $unset: [
          "IDCreador.password",
          "EtapaPedido.nivel",
          "PrioridadPedido.nivel",
        ],
      },
    ]);

    if (!pedidosDB || pedidosDB.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      // console.log(pedidosDB[0].data);

      return resp.json({
        ok: true,
        pedidosDB: pedidosDB,
        // pedidosDB: pedidosDB[0].data,
        cantidad: pedidosDB.length,
        // totalDB: pedidosDB[0].metadata[0].total,
      });
    }
  }

  async entregadoPorEntregar(req: any, resp: Response): Promise<any> {
    const role = req.get("role");
    const idSucursalWorker = req.get("idSucursalWorker");
    const idUsuario = req.get("idUsuario");

    const porEntregar = req.get("porEntregar");
    const entregado = req.get("entregado");

    const arrEstado = new Array(2);

    arrEstado[0] = porEntregar;
    arrEstado[1] = entregado;

    const match = {
      $match: {},
    };

    // for (let i = 0; i < 3; i++) {
    //   console.log(i);
    // }
    // console.log(arrEstado);
    // if (
    //   role === environmnet.colRole.SuperRole ||
    //   role === environmnet.colRole.AdminRole
    // ) {
    //   match.$match;
    // }

    if (role === environmnet.colRole.VendedorNormalRole) {
      match.$match = {
        // sucursal: new mongoose.Types.ObjectId(idSucursalWorker),
        idCreador: new mongoose.Types.ObjectId(req.usuario._id),
      };
    }

    if (role === environmnet.colRole.produccionNormal) {
      match.$match = {
        $and: [
          { sucursal: new mongoose.Types.ObjectId(idSucursalWorker) },
          { etapa_pedido: 2 },
        ],
      };
    }

    if (role === environmnet.colRole.produccionVIP) {
      match.$match = { etapa_pedido: 2 };
    }

    if (role === environmnet.colRole.DiseniadorRole) {
      match.$match = {
        $and: [
          { etapa_pedido: 1 },
          { "AsignadoA._id": new mongoose.Types.ObjectId(idUsuario) },
        ],
      };
    }

    if (arrEstado[0] === "null") {
      Object.assign(match.$match, { etapa_pedido: 4 });
      // match.$match = { etapa_pedido: 4 };
    }
    if (arrEstado[1] === "null") {
      Object.assign(match.$match, { etapa_pedido: 3 });

      // match.$match = { etapa_pedido: 3 };
    }
    if (arrEstado[0] !== "null" && arrEstado[1] !== "null") {
      Object.assign(match.$match, {
        $or: [{ etapa_pedido: 3 }, { etapa_pedido: 4 }],
      });
      // match.$match = {
      //   $or: [{ etapa_pedido: 3 }, { etapa_pedido: 4 }],
      // };
    }
    if (arrEstado[0] === "null" && arrEstado[1] === "null") {
      match.$match;
    }

    const pedidosDB = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },
      match,
      {
        $sort: { etapa_pedido: 1, prioridad_pedido: 1, fecha_actual: 1 }, // prioridad_pedido: 1, fecha_actual: 1
      },
      {
        $unset: [
          "IDCreador.password",
          "EtapaPedido.nivel",
          "PrioridadPedido.nivel",
        ],
      },
    ]);

    if (!pedidosDB || pedidosDB.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      return resp.json({
        ok: true,
        pedidosDB: pedidosDB,
        cantidad: pedidosDB.length,
      });
    }
  }

  async porEntregar(req: any, resp: Response): Promise<any> {
    const match = {
      $match: { etapa_pedido: 3 },
    };

    const pedidosDB = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },
      match,
      {
        $sort: { etapa_pedido: 1, prioridad_pedido: 1, fecha_actual: 1 }, // prioridad_pedido: 1, fecha_actual: 1
      },
      {
        $unset: [
          "IDCreador.password",
          "EtapaPedido.nivel",
          "PrioridadPedido.nivel",
        ],
      },
    ]);

    if (!pedidosDB || pedidosDB.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      return resp.json({
        ok: true,
        pedidosDB: pedidosDB,
        cantidad: pedidosDB.length,
      });
    }
  }

  async obtenerTodos(req: any, resp: Response): Promise<any> {
    // console.log("obtener Todos");

    // const estadoHeader: string = req.get('estado');
    // const estado: boolean = castEstado(estadoHeader);

    // const fecha_actual: string = moment().format('YYYY-MM-DD');
    const respPedido = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },
      // {
      //     $match: { estado: true } // estado: estado
      // },
      {
        $sort: { etapa_pedido: 1, prioridad_pedido: 1, fecha_actual: 1 }, // prioridad_pedido: 1, fecha_actual: 1
      },
      {
        $unset: [
          "IDCreador.password",
          "EtapaPedido.nivel",
          "PrioridadPedido.nivel",
        ],
      },
    ]);

    if (!respPedido || respPedido.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      // const server = Server.instance;
      // server.io.emit("cargar-pedidos", {
      //   ok: true,
      //   pedidosDB: respPedido,
      //   cantidad: respPedido.length,
      // });

      const server = Server.instance;
      server.io.emit("recibir-pedidos", {
        ok: true,
        pedidosDB: respPedido,
        cantidad: respPedido.length,
      });
      return resp.json({
        ok: true,
        pedidosDB: respPedido,
        cantidad: respPedido.length,
      });
    }
  }

  async obtenerPorBusqueda(req: any, resp: Response): Promise<any> {
    const role = req.get("role");
    const idSucursalWorker = req.get("idSucursalWorker");
    const idUsuario = req.get("idUsuario");

    // const match = {
    //   $match: {},
    // };

    const criterio = new RegExp(req.get("criterio"), "i");

    // if (req.get("criterio") !== "") {
    // if (role === environmnet.colRole.DiseniadorRole) {
    //   match.$match = {
    //     $and: [
    //       {
    //         $and: [
    //           { etapa_pedido: 1 },
    //           { "AsignadoA._id": new mongoose.Types.ObjectId(idUsuario) },
    //         ],
    //       },
    //       {
    //         $or: [
    //           { "Cliente.nombre": criterio },
    //           { idReferencia: criterio },
    //           { "Cliente.telefono": criterio },
    //         ],
    //       },
    //       {
    //         // $or: [
    //         //   { etapa_pedido: 0 },
    //         //   { etapa_pedido: 1 },
    //         //   { etapa_pedido: 2 },
    //         // ],
    //       },
    //     ],
    //   };
    // }
    // if (role === environmnet.colRole.DiseniadorVIPRole) {
    //   match.$match = {
    //     $and: [
    //       // {
    //       //   $and: [
    //       //     { etapa_pedido: 1 },
    //       //     { "AsignadoA._id": new mongoose.Types.ObjectId(idUsuario) },
    //       //   ],
    //       // },
    //       {
    //         $or: [
    //           { "Cliente.nombre": criterio },
    //           { idReferencia: criterio },
    //           { "Cliente.telefono": criterio },
    //         ],
    //       },
    //       {
    //         // $or: [
    //         //   { etapa_pedido: 0 },
    //         //   { etapa_pedido: 1 },
    //         //   { etapa_pedido: 2 },
    //         // ],
    //       },
    //     ],
    //   };
    // }
    // if (role === environmnet.colRole.VendedorNormalRole) {
    //   match.$match = {
    //     $and: [
    //       // {
    //       //   $and: [
    //       //     { idCreador: new mongoose.Types.ObjectId(req.usuario._id) },
    //       //   ],
    //       // },
    //       {
    //         $or: [
    //           { "Cliente.nombre": criterio },
    //           { idReferencia: criterio },
    //           { "Cliente.telefono": criterio },
    //         ],
    //       },
    //       {
    //         // $or: [
    //         //   { etapa_pedido: 0 },
    //         //   { etapa_pedido: 1 },
    //         //   { etapa_pedido: 2 },
    //         // ],
    //       },
    //     ],
    //   };
    // }
    // if (role === environmnet.colRole.produccionVIP) {
    //   match.$match = {
    //     $and: [
    //       // {
    //       //   $and: [(match.$match = { etapa_pedido: 2 })],
    //       // },
    //       {
    //         $or: [
    //           { "Cliente.nombre": criterio },
    //           { idReferencia: criterio },
    //           { "Cliente.telefono": criterio },
    //         ],
    //       },
    //       {
    //         // $or: [
    //         //   { etapa_pedido: 0 },
    //         //   { etapa_pedido: 1 },
    //         //   { etapa_pedido: 2 },
    //         // ],
    //       },
    //     ],
    //   };
    // }
    // if (role === environmnet.colRole.VendedorVIPRole) {
    //   match.$match = {
    //     $and: [
    //       // {
    //       //   $and: [
    //       //     { idCreador: new mongoose.Types.ObjectId(req.usuario._id) },
    //       //   ],
    //       // },
    //       {
    //         $or: [
    //           { "Cliente.nombre": criterio },
    //           { idReferencia: criterio },
    //           { "Cliente.telefono": criterio },
    //         ],
    //       },
    //       {
    //         // $or: [
    //         //   { etapa_pedido: 0 },
    //         //   { etapa_pedido: 1 },
    //         //   { etapa_pedido: 2 },
    //         // ],
    //       },
    //     ],
    //   };
    // }
    // if (
    //   role === environmnet.colRole.SuperRole ||
    //   role === environmnet.colRole.AdminRole
    // ) {
    //   match.$match = {
    //     $and: [
    //       // {
    //       //   $and: [
    //       //     { sucursal: new mongoose.Types.ObjectId(idSucursalWorker) },
    //       //     { etapa_pedido: 2 },
    //       //   ],
    //       // },
    //       {
    //         $or: [
    //           { "Cliente.nombre": criterio },
    //           { idReferencia: criterio },
    //           { "Cliente.telefono": criterio },
    //         ],
    //       },
    //       {
    //         // $or: [
    //         //   { etapa_pedido: 0 },
    //         //   { etapa_pedido: 1 },
    //         //   { etapa_pedido: 2 },
    //         // ],
    //       },
    //     ],
    //   };
    // }
    // if (role === environmnet.colRole.produccionNormal) {
    //   match.$match = {
    //     $and: [
    //       // {
    //       //   $and: [
    //       //     { sucursal: new mongoose.Types.ObjectId(idSucursalWorker) },
    //       //     { etapa_pedido: 2 },
    //       //   ],
    //       // },
    //       {
    //         $or: [
    //           { "Cliente.nombre": criterio },
    //           { idReferencia: criterio },
    //           { "Cliente.telefono": criterio },
    //         ],
    //       },
    //       {
    //         // $or: [
    //         //   { etapa_pedido: 0 },
    //         //   { etapa_pedido: 1 },
    //         //   { etapa_pedido: 2 },
    //         // ],
    //       },
    //     ],
    //   };
    // }
    // }

    const pedidosDB: any = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },
      {
        $match: {
          $or: [

            { "Cliente.nombre": criterio },
            { idReferencia: criterio },
            { "Cliente.telefono": criterio },

          ]
        }
      },
      {
        $sort: { etapa_pedido: 1, prioridad_pedido: 1, fecha_actual: 1 }, // prioridad_pedido: 1, fecha_actual: 1
      },
      // {
      //   $facet: {
      //     metadata: [{ $count: "total" }],
      //     data: [{ $limit: hasta }],
      //   },
      // },
      // {
      //   $limit: hasta, // hasta
      // },
      // {
      //   $skip: desde, // desde
      // },
      {
        $unset: [
          "IDCreador.password",
          "EtapaPedido.nivel",
          "PrioridadPedido.nivel",
        ],
      },
    ]);

    if (!pedidosDB || pedidosDB.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      // console.log(pedidosDB[0].data);
      return resp.json({
        ok: true,
        pedidosDB: pedidosDB,
        // pedidosDB: pedidosDB[0].data,
        cantidad: pedidosDB.length,
        // totalDB: pedidosDB[0].metadata[0].total,
      });
    }
  }

  async busquedaBandeja(req: any, resp: Response): Promise<any> {
    // const estadoHeader: string = req.get('estado');
    // const estado: boolean = castEstado(estadoHeader);

    // const role = req.get("colRole");
    const userID = req.get("userID");
    const sucursal = req.get("sucursal");
    const bandejas = req.get("bandejas");
    const page = Number(req.get("page"));
    const hasta: number = page * 5 || 5;
    const match: any = {
      $match: {},
    };

    const roleAuth = req.usuario.colaborador_role;
    const IDUsuario = req.usuario._id;

    // console.log(roleAuth);

    if (
      roleAuth === environmnet.colRole.AdminRole ||
      roleAuth === environmnet.colRole.SuperRole
    ) {
      if (bandejas === "null" && sucursal === "null" && userID === "null") {
        match.$match;
      } else if (
        bandejas === "null" &&
        sucursal !== "null" &&
        userID === "null"
      ) {
        match.$match = { sucursal: new mongoose.Types.ObjectId(sucursal) };
      } else if (
        bandejas !== "null" &&
        sucursal !== "null" &&
        userID !== "null"
      ) {
        switch (bandejas) {
          case "vend":
            match.$match = {
              $and: [
                { idCreador: new mongoose.Types.ObjectId(userID) },
                { sucursal: new mongoose.Types.ObjectId(sucursal) },
              ],
            };
            break;
          case "dise":
            match.$match = {
              $and: [
                { asignado_a: new mongoose.Types.ObjectId(userID) },
                { sucursal: new mongoose.Types.ObjectId(sucursal) },
              ],
            };
            break;
        }
      } else if (
        bandejas !== "null" &&
        sucursal === "null" &&
        userID !== "null"
      ) {
        switch (bandejas) {
          case "vend":
            match.$match = { idCreador: new mongoose.Types.ObjectId(userID) };
            break;
          case "dise":
            match.$match = { asignado_a: new mongoose.Types.ObjectId(userID) };
            break;
        }
      } else if (
        bandejas !== "null" &&
        sucursal === "null" &&
        userID === "null"
      ) {
        switch (bandejas) {
          case "prod":
            match.$match = { etapa_pedido: 2 };
            break;
          case "vend":
            match.$match;
            break;
          case "dise":
            match.$match = { etapa_pedido: 1 };
            break;
        }
      } else if (
        bandejas !== "null" &&
        sucursal !== "null" &&
        userID === "null"
      ) {
        switch (bandejas) {
          case "prod":
            match.$match = {
              $and: [
                { etapa_pedido: 2 },
                { sucursal: new mongoose.Types.ObjectId(sucursal) },
              ],
            };
            break;
          case "vend":
            match.$match = { sucursal: new mongoose.Types.ObjectId(sucursal) };
            break;
          case "dise":
            match.$match = {
              $and: [
                { etapa_pedido: 1 },
                { sucursal: new mongoose.Types.ObjectId(sucursal) },
              ],
            };
            break;
        }
      }
    } else if (roleAuth === environmnet.colRole.produccionVIP) {
      if (bandejas !== "null" && sucursal === "null" && userID === "null") {
        match.$match = { etapa_pedido: 2 };
      } else if (
        bandejas !== "null" &&
        sucursal !== "null" &&
        userID === "null"
      ) {
        match.$match = {
          $and: [
            { etapa_pedido: 2 },
            { sucursal: new mongoose.Types.ObjectId(sucursal) },
          ],
        };
      }
    } else if (roleAuth === environmnet.colRole.VendedorVIPRole) {
      if (bandejas === "null" && sucursal === "null" && userID === "null") {
        match.$match;
      } else if (
        bandejas === "null" &&
        sucursal !== "null" &&
        userID === "null"
      ) {
        match.$match = { sucursal: new mongoose.Types.ObjectId(sucursal) };
      } else if (
        bandejas !== "null" &&
        sucursal !== "null" &&
        userID !== "null"
      ) {
        match.$match = {
          $and: [
            { sucursal: new mongoose.Types.ObjectId(sucursal) },
            { idCreador: new mongoose.Types.ObjectId(userID) },
          ],
        };
      } else if (
        bandejas !== "null" &&
        sucursal === "null" &&
        userID !== "null"
      ) {
        match.$match = { idCreador: new mongoose.Types.ObjectId(userID) };
      } else if (
        bandejas !== "null" &&
        sucursal === "null" &&
        userID === "null"
      ) {
        // console.log("ok");
        switch (bandejas) {
          case "miband":
            match.$match = {
              idCreador: new mongoose.Types.ObjectId(IDUsuario),
            };
            break;
          case "vend":
            match.$match = {};
            break;
        }
      } else if (
        bandejas !== "null" &&
        sucursal !== "null" &&
        userID === "null"
      ) {
        switch (bandejas) {
          case "miband":
            match.$match = {
              $and: [
                { idCreador: new mongoose.Types.ObjectId(IDUsuario) },
                { sucursal: new mongoose.Types.ObjectId(sucursal) },
              ],
            };
            break;
          case "vend":
            match.$match = { sucursal: new mongoose.Types.ObjectId(sucursal) };
            break;
        }
      }
    } else if (roleAuth === environmnet.colRole.DiseniadorVIPRole) {
      if (bandejas === "null" && sucursal === "null" && userID === "null") {
        match.$match = {
          etapa_pedido: 1,
        };
      } else if (
        bandejas === "null" &&
        sucursal !== "null" &&
        userID === "null"
      ) {
        match.$match = {
          $and: [
            { etapa_pedido: 1 },
            { sucursal: new mongoose.Types.ObjectId(sucursal) },
          ],
        };
      } else if (
        bandejas !== "null" &&
        sucursal !== "null" &&
        userID !== "null"
      ) {
        match.$match = {
          $and: [
            { etapa_pedido: 1 },
            { sucursal: new mongoose.Types.ObjectId(sucursal) },
            { asignado_a: new mongoose.Types.ObjectId(userID) },
          ],
        };
      } else if (
        bandejas !== "null" &&
        sucursal === "null" &&
        userID !== "null"
      ) {
        match.$match = {
          $and: [
            { etapa_pedido: 1 },
            { asignado_a: new mongoose.Types.ObjectId(userID) },
          ],
        };
      } else if (
        bandejas !== "null" &&
        sucursal === "null" &&
        userID === "null"
      ) {
        switch (bandejas) {
          case "miband":
            match.$match = {
              $and: [
                { etapa_pedido: 1 },
                { asignado_a: new mongoose.Types.ObjectId(IDUsuario) },
              ],
            };
            break;
          case "dise":
            match.$match = { etapa_pedido: 1 };
            break;
        }
      } else if (
        bandejas !== "null" &&
        sucursal !== "null" &&
        userID === "null"
      ) {
        switch (bandejas) {
          case "miband":
            match.$match = {
              $and: [
                { etapa_pedido: 1 },
                { asignado_a: new mongoose.Types.ObjectId(IDUsuario) },
                { sucursal: new mongoose.Types.ObjectId(sucursal) },
              ],
            };
            break;
          case "dise":
            match.$match = {
              $and: [
                { etapa_pedido: 1 },
                { sucursal: new mongoose.Types.ObjectId(sucursal) },
              ],
            };
            break;
        }
      }
    }

    Object.assign(match.$match, {
      $or: [{ etapa_pedido: 0 }, { etapa_pedido: 1 }, { etapa_pedido: 2 }],
    });

    const pedidosDB = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "Worker",
        },
      },

      {
        $sort: { etapa_pedido: 1, prioridad_pedido: 1, fecha_actual: 1 },
      },
      match,
      {
        $unset: ["AsignadoA.password", "IDCreador.password"],
      },
    ]);

    if (!pedidosDB || pedidosDB.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      return resp.json({
        ok: true,
        pedidosDB: pedidosDB,
        cantidad: pedidosDB.length,
      });
    }
  }

  //  CONSIDERAR BORRAR DESDE AQUI =========================================================
  async obtenerDisenio(
    req: any,
    resp: Response,
    idColaborador: any
  ): Promise<any> {
    // Disenio Grafico

    const estado: boolean = req.get("estado");
    // const estado: boolean = castEstado(estadoHeader);

    const resPedido = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },

      {
        $sort: { "PrioridadPedido.importancia": 1, fecha_actual: 1 },
      },
      {
        $match: {
          "AsignadoA._id": new mongoose.Types.ObjectId(idColaborador),
          "EtapaPedido.nombre": "Diseño gráfico",
          estado: estado,
        },
      },
      {
        $unset: ["AsignadoA.password", "IDCreador.password"],
      },
    ]);

    if (!resPedido || resPedido.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      return resp.json({
        ok: true,
        resPedido: resPedido,
        cantidad: resPedido.length,
      });
    }
  }

  async obtenerProduccion(
    req: any,
    resp: Response,
    idColaborador: any
  ): Promise<any> {
    // Produccion

    const estado: boolean = req.get("estado");
    // const estado: boolean = castEstado(estadoHeader);

    const role = req.usuario.colaborador_role;
    const sucursalCol = req.usuario.sucursal;
    const match: any = {
      $match: {},
    };

    if (role === environmnet.colRole.produccionNormal) {
      match.$match = {
        "EtapaPedido.nombre": "Producción",
        "Sucursal._id": new mongoose.Types.ObjectId(sucursalCol),
        estado: estado,
      };
    } else if (role === environmnet.colRole.produccionVIP) {
      match.$match = { "EtapaPedido.nombre": "Producción", estado: estado };
    }

    const resPedido = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },

      {
        $sort: { "PrioridadPedido.importancia": 1, fecha_actual: 1 },
      },
      match,
      {
        $unset: ["AsignadoA.password", "IDCreador.password"],
      },
    ]);

    if (!resPedido || resPedido.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      return resp.json({
        ok: true,
        resPedido: resPedido,
        cantidad: resPedido.length,
      });
    }
  }

  async obtenerVendedor(req: any, resp: Response): Promise<any> {
    // Produccion

    // const estadoHeader: string = req.get('estado');
    // const estado: boolean = castEstado(estadoHeader);
    const idUsuario = req.get("idUsuario");

    const role = req.usuario.colaborador_role;
    const match: any = {
      $match: {},
    };

    if (role === environmnet.colRole.VendedorNormalRole) {
      // match.$match = { 'Sucursal._id': new mongoose.Types.ObjectId(sucursalCol) } //, estado: estado
      match.$match = {
        "IDCreador._id": new mongoose.Types.ObjectId(idUsuario),
      }; //, estado: estado
    }

    const resPedido = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },

      {
        $sort: { "PrioridadPedido.importancia": 1, fecha_actual: 1 },
      },
      match,
      {
        $unset: ["AsignadoA.password", "IDCreador.password"],
      },
    ]);

    if (!resPedido || resPedido.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      return resp.json({
        ok: true,
        resPedido: resPedido,
        cantidad: resPedido.length,
      });
    }
  }

  async obtenerEtapa(req: any, resp: Response): Promise<any> {
    // Produccion, Diseñador

    const estado: boolean = req.get("estado");
    // const estado: boolean = castEstado(estadoHeader);

    const idColaborador = req.get("idColaborador");
    const nombreEtapaPedido = req.get("nombreEtapaPedido");

    // const fecha_actual: string = moment().format('YYYY-MM-DD');

    const resPedido = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "archivos",
          foreignField: "_id",
          as: "Archivos",
        },
      },
      {
        $lookup: {
          from: "productopedidos",
          localField: "productos_pedidos",
          foreignField: "_id",
          as: "ProductosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "pagos_pedido",
          foreignField: "_id",
          as: "PagosPedido",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "idCreador",
          foreignField: "_id",
          as: "IDCreador",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "Cliente",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "asignado_a",
          foreignField: "_id",
          as: "AsignadoA",
        },
      },
      {
        $lookup: {
          from: "etapapedidos",
          localField: "etapa_pedido",
          foreignField: "_id",
          as: "EtapaPedido",
        },
      },
      {
        $lookup: {
          from: "prioridadpedidos",
          localField: "prioridad_pedido",
          foreignField: "_id",
          as: "PrioridadPedido",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "Sucursal",
        },
      },

      {
        $sort: { "PrioridadPedido.importancia": 1, fecha_actual: 1 },
      },
      {
        $match: {
          "AsignadoA._id": new mongoose.Types.ObjectId(idColaborador),
          "EtapaPedido.nombre": nombreEtapaPedido,
          estado: estado,
        },
      },
      {
        $unset: ["AsignadoA.password", "IDCreador.password"],
      },
    ]);

    if (!resPedido || resPedido.length === 0) {
      return resp.json({
        ok: false,
        mensaje: `No se encontraron pedidos`,
      });
    } else {
      return resp.json({
        ok: true,
        resPedido: resPedido,
        cantidad: resPedido.length,
      });
    }
  }

  redireccionBandejas(req: any, resp: Response): void {
    const role: string = req.usuario.colaborador_role;
    const idColaborador: any = req.usuario._id;

    switch (role) {
      case "DiseniadorRole":
        this.obtenerDisenio(req, resp, idColaborador);
        break;
      case "ProduccionVIPRole":
        this.obtenerProduccion(req, resp, idColaborador);
        break;
      case "ProduccionNormalRole":
        this.obtenerProduccion(req, resp, idColaborador);
        break;
      case "VendedorVIPRole":
        this.obtenerTodos(req, resp);
        break;
      case "VendedorNormalRole":
        this.obtenerVendedor(req, resp);
        break;
      case "AdminRole":
        this.obtenerTodos(req, resp);
        break;
      case "SuperRole":
        this.obtenerTodos(req, resp);
        break;
    }
  }
}

// Interfaz para manejar los datos del archivo usuariosIDs.json
interface Archivo {
  ids: Array<string>;
}

interface RespPromise {
  ok: boolean;
  data: string;
}

/*
           1. Asignado a
           2. etapa
           3. Evitar que otro usuario se le asigne el mismo pedido
       */
