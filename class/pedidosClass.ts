import { Response } from "express";
import { Error } from "mongoose";
const mongoose = require("mongoose");
import { customAlphabet } from "nanoid";
import { environment } from "../environment/environment";

// import moment from "moment";
import moment from "moment-timezone";
moment.locale("es");

// Modelo
import pedidoModel from "../models/pedidoModel";
import historialModel from "../models/historialModel";
import pagosModel from "../models/pagosModel";
import prodPedModel from "../models/producto-pedido-model";

// Interface
import { PedidosInterface } from "../interfaces/pedidos";
import { HistorialInterface } from "../interfaces/historial";

import Server from "./server";

export class PedidosClass {
  private idRef: any;

  constructor() {
    this.idRef = customAlphabet("1234567890", 6);
  }

  crearPedido(req: any, resp: Response): void {
    const idReferencia: string = this.idRef();
    const cliente = new mongoose.Types.ObjectId(req.body.cliente);
    const vendedor = new mongoose.Types.ObjectId(req.body.vendedor);
    const sucursal = new mongoose.Types.ObjectId(req.body.sucursal);
    const fechaRegistro = moment()
      .tz("America/Bogota")
      .format(req.body.fechaRegistro);
    const fechaEntrega = moment()
      .tz("America/Bogota")
      .format(req.body.fechaEntrega);
    const prioridad = new mongoose.Types.ObjectId(req.body.prioridad);
    const etapa = new mongoose.Types.ObjectId(req.body.etapa);
    const foranea = new mongoose.Types.ObjectId(req.body.foranea);
    const idEmpresa: string = req.body.foranea;

    const crearNuevoPedido = new pedidoModel({
      idReferencia,
      cliente,
      vendedor,
      sucursal,
      fechaRegistro,
      fechaEntrega,
      prioridad,
      etapa,
      foranea,
    });

    crearNuevoPedido.save(async (err: any) => {
      if (err) {
        return resp.json({
          ok: false,
          mensaje: `Error interno`,
          err,
        });
      } else {
        const server = Server.instance;
        server.io.in(idEmpresa).emit("cargar-pedidos", { ok: true });
        return resp.json({
          ok: true,
          mensaje: `Pedido creado`,
        });
      }
    });
  }

  async obtenerPedidos(req: any, resp: Response): Promise<any> {
    let sucursales: Array<any> = [];
    let etapas: Array<any> = [];
    let verPropias = req.get("verPropias");
    let usuario = null;
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));

    if (verPropias === "true") {
      usuario = new mongoose.Types.ObjectId(req.usuario._id);
    } else {
      usuario = { $ne: null };
    }

    try {
      sucursales = (req.get("sucursales") as string).split(",");
      etapas = (req.get("etapas") as string).split(",");
      sucursales = sucursales.map((sucursal) => {
        return new mongoose.Types.ObjectId(sucursal);
      });

      etapas = etapas.map((etapa) => {
        return new mongoose.Types.ObjectId(etapa);
      });
    } catch (error) {
      if (!sucursales && etapas) {
        sucursales = [];
        etapas = (req.get("etapas") as string).split(",");
        etapas = etapas.map((etapa) => {
          return new mongoose.Types.ObjectId(etapa);
        });
      }
      if (!etapas && sucursales) {
        etapas = [];
        sucursales = (req.get("sucursales") as string).split(",");
        sucursales = sucursales.map((sucursal) => {
          return new mongoose.Types.ObjectId(sucursal);
        });
      }

      // console.log(error);
    }

    const pedidosDB = await pedidoModel.aggregate([
      {
        $match: {
          $and: [
            {
              foranea,
            },
            { $expr: { $in: ["$etapa", etapas] } },
            { $expr: { $in: ["$sucursal", sucursales] } },
            {
              $or: [
                { vendedor: usuario },
                // { vendedor: { $eq: null } },
                { diseniador: usuario },
              ],
            },
            {
              archivado: false,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "vendedor",
          foreignField: "_id",
          as: "vendedor",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "sucursal",
        },
      },
      {
        $lookup: {
          from: "prioridads",
          localField: "prioridad",
          foreignField: "_id",
          as: "prioridad",
        },
      },
      {
        $lookup: {
          from: "etapas",
          localField: "etapa",
          foreignField: "_id",
          as: "etapa",
        },
      },
      {
        $lookup: {
          from: "colores",
          localField: "color",
          foreignField: "_id",
          as: "color",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "diseniador",
          foreignField: "_id",
          as: "diseniador",
        },
      },
      {
        $lookup: {
          from: "productos-pedidos",
          localField: "_id",
          foreignField: "pedido",
          as: "productosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "_id",
          foreignField: "pedido",
          as: "pagos",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "_id",
          foreignField: "pedido",
          as: "archivos",
        },
      },
      {
        $unwind: { path: "$vendedor", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$sucursal", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$prioridad", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$etapa", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$color", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$diseniador", preserveNullAndEmptyArrays: true },
      },
    ]);

    if (!pedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al obtener los pedidos",
      });
    } else {
      return resp.json({
        ok: true,
        pedidosDB,
      });
    }
  }

  async buscarPedidos(req: any, resp: Response): Promise<any> {
    const criterio = new RegExp(req.get("criterio"), "i");
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));
    const pedidosDB = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "userworkers",
          localField: "vendedor",
          foreignField: "_id",
          as: "vendedor",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "sucursal",
        },
      },
      {
        $lookup: {
          from: "prioridads",
          localField: "prioridad",
          foreignField: "_id",
          as: "prioridad",
        },
      },
      {
        $lookup: {
          from: "etapas",
          localField: "etapa",
          foreignField: "_id",
          as: "etapa",
        },
      },
      {
        $lookup: {
          from: "colores",
          localField: "color",
          foreignField: "_id",
          as: "color",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "diseniador",
          foreignField: "_id",
          as: "diseniador",
        },
      },
      {
        $lookup: {
          from: "productos-pedidos",
          localField: "_id",
          foreignField: "pedido",
          as: "productosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "_id",
          foreignField: "pedido",
          as: "pagos",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "_id",
          foreignField: "pedido",
          as: "archivos",
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { idReferencia: { $regex: criterio } },
                { "cliente.nombre": { $regex: criterio } },
                { "cliente.telefono": { $regex: criterio } },
              ],
            },
            { foranea },
          ],
        },
      },
      {
        $unwind: { path: "$vendedor", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$sucursal", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$prioridad", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$etapa", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$color", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$diseniador", preserveNullAndEmptyArrays: true },
      },
    ]);

    if (!pedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al obtener los pedidos",
      });
    } else {
      return resp.json({
        ok: true,
        pedidosDB,
      });
    }
  }

  async buscarArchivados(req: any, resp: Response): Promise<any> {
    const criterio = new RegExp(req.get("criterio"), "i");
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));
    const pedidosDB = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "userworkers",
          localField: "vendedor",
          foreignField: "_id",
          as: "vendedor",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "sucursal",
        },
      },
      {
        $lookup: {
          from: "prioridads",
          localField: "prioridad",
          foreignField: "_id",
          as: "prioridad",
        },
      },
      {
        $lookup: {
          from: "etapas",
          localField: "etapa",
          foreignField: "_id",
          as: "etapa",
        },
      },
      {
        $lookup: {
          from: "colores",
          localField: "color",
          foreignField: "_id",
          as: "color",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "diseniador",
          foreignField: "_id",
          as: "diseniador",
        },
      },
      {
        $lookup: {
          from: "productos-pedidos",
          localField: "_id",
          foreignField: "pedido",
          as: "productosPedidos",
        },
      },
      {
        $lookup: {
          from: "pagos",
          localField: "_id",
          foreignField: "pedido",
          as: "pagos",
        },
      },
      {
        $lookup: {
          from: "archivos",
          localField: "_id",
          foreignField: "pedido",
          as: "archivos",
        },
      },
      {
        $match: { $and: [{ archivado: true }, { foranea }] },
      },
      {
        $unwind: { path: "$vendedor", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$sucursal", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$prioridad", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$etapa", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$color", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$diseniador", preserveNullAndEmptyArrays: true },
      },
    ]);

    if (!pedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al obtener los pedidos",
      });
    } else {
      return resp.json({
        ok: true,
        pedidosDB,
      });
    }
  }

  async obtenerPedido(req: any, resp: Response): Promise<any> {
    const _id = new mongoose.Types.ObjectId(req.get("id"));
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));
    const pedidosDB = await pedidoModel.aggregate([
      {
        $match: { $and: [{ _id }, { foranea }] },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "vendedor",
          foreignField: "_id",
          as: "vendedor",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
          pipeline: [
            {
              $lookup: {
                from: "sucursales",
                localField: "sucursal",
                foreignField: "_id",
                as: "sucursal",
              },
            },
            {
              $unwind: { path: "$sucursal", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "sucursal",
        },
      },
      {
        $lookup: {
          from: "prioridads",
          localField: "prioridad",
          foreignField: "_id",
          as: "prioridad",
        },
      },
      {
        $lookup: {
          from: "etapas",
          localField: "etapa",
          foreignField: "_id",
          as: "etapa",
        },
      },
      {
        $lookup: {
          from: "colores",
          localField: "color",
          foreignField: "_id",
          as: "color",
        },
      },
      {
        $lookup: {
          from: "origenpedidos",
          localField: "origen",
          foreignField: "_id",
          as: "origen",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "diseniador",
          foreignField: "_id",
          as: "diseniador",
        },
      },
      {
        $lookup: {
          from: "productos-pedidos",
          localField: "_id",
          foreignField: "pedido",
          as: "productosPedidos",
          pipeline: [
            {
              $lookup: {
                from: "products",
                localField: "producto",
                foreignField: "_id",
                as: "producto",
              },
            },
            {
              $unwind: { path: "$producto", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
      {
        $unwind: { path: "$vendedor", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$sucursal", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$prioridad", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$etapa", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$color", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$origen", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$diseniador", preserveNullAndEmptyArrays: true },
      },
    ]);

    if (!pedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al obtener los pedidos",
      });
    } else {
      return resp.json({
        ok: true,
        pedidoDB: pedidosDB[0],
      });
    }
  }

  editarInfo(req: any, resp: Response): void {
    const _id = new mongoose.Types.ObjectId(req.body.id);
    const foranea = new mongoose.Types.ObjectId(req.body.foranea);
    const idEmpresa = req.body.foranea;
    const fechaEntrega = req.body.fechaEntrega;
    const prioridad = new mongoose.Types.ObjectId(req.body.prioridad);
    const etapa = new mongoose.Types.ObjectId(req.body.etapa);
    const diseniador = new mongoose.Types.ObjectId(req.body.diseniador);
    const color = new mongoose.Types.ObjectId(req.body.color);
    const origen = new mongoose.Types.ObjectId(req.body.origen);
    const vendedor = new mongoose.Types.ObjectId(req.body.vendedor);
    const sucursal = new mongoose.Types.ObjectId(req.body.sucursal);
    const archivado: boolean = req.body.archivado;

    const query = {
      fechaEntrega,
      prioridad,
      etapa,
      diseniador,
      color,
      origen,
      vendedor,
      sucursal,
      archivado,
    };

    pedidoModel.findOneAndUpdate(
      { _id, foranea },
      query,
      { new: true },
      (err: any, pedidoDB: any) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: "Error al actualizar info del pedido",
            err,
          });
        } else {
          const server = Server.instance;
          server.io.in(idEmpresa).emit("cargar-pedidos", { ok: true });
          return resp.json({
            ok: true,
            pedidoDB,
          });
        }
      }
    );
  }

  eliminarPedido(req: any, resp: Response): void {
    // const arrPedidos: Array<any> = req.body.arrPedidos;
    const idPedido = new mongoose.Types.ObjectId(req.get("idPedido"));
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));
    const idEmpresa: string = req.get("foranea");

    // console.log(arrPedidos);
    // return;

    // arrPedidos.forEach((pedido) => {
    // const borrarArchivos = new Promise(async (resolve, reject) => {
    //   archivoMOdel.deleteMany(
    //     { pedido: idPedido },
    //     (err: any, dataArchivoDB: any) => {
    //       if (err) {
    //         reject(false);
    //       } else {
    //         resolve(true);
    //       }
    //     }
    //   );
    // });
    const borrarProdPed = new Promise(async (resolve, reject) => {
      pagosModel.deleteMany({ pedido: idPedido, foranea }, (err: any) => {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
    const borrarPagos = new Promise(async (resolve, reject) => {
      prodPedModel.deleteMany({ pedido: idPedido, foranea }, (err: any) => {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });

    const borrarPedidos = new Promise(async (resolve, reject) => {
      pedidoModel.deleteMany({ _id: idPedido, foranea }, (err: any) => {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });

    Promise.all([borrarProdPed, borrarPagos, borrarPedidos])
      .then((respProm) => {
        const server = Server.instance;
        server.io.in(idEmpresa).emit("cargar-pedidos", { ok: true });
        return resp.json({
          ok: true,
        });
      })
      .catch((err) => {
        return resp.json({
          ok: false,
        });
      });
    // });
  }

  guardarHistorial(req: any, resp: Response): void {
    const historial: HistorialInterface = req.body.historial;
    const foranea = new mongoose.Types.ObjectId(req.body.foranea);

    const nuevoHistorial = new historialModel({
      priorOrg: historial.priorOrg,
      etapaOrg: historial.etapaOrg,
      estadoOrg: historial.estadoOrg,
      vendedorOrg: historial.vendedorOrg,
      diseniadorOrg: historial.diseniadorOrg,
      priorAct: historial.priorAct,
      etapaAct: historial.etapaAct,
      estadoAct: historial.estadoAct,
      vendedorAct: historial.vendedorAct,
      diseniadorAct: historial.diseniadorAct,
      idPedido: historial.idPedido,
      fecha: historial.fecha,
      usuario: historial.usuario,
      foranea,
    });

    nuevoHistorial.save((err: any, historialDB: any) => {
      if (err) {
        return resp.json({
          ok: false,
          mensaje: `Error interno`,
          err,
        });
      } else {
        return resp.json({
          ok: true,
          mensaje: `Historial creado`,
          historialDB,
        });
      }
    });
  }

  obtenerHistorial(req: any, resp: Response): void {
    const idPedido = new mongoose.Types.ObjectId(req.get("idPedido"));
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));

    historialModel
      .find({ idPedido, foranea })
      .populate("priorOrg")
      .populate("etapaOrg")
      .populate("estadoOrg")
      .populate("priorAct")
      .populate("etapaAct")
      .populate("estadoAct")
      .populate("usuario")
      .populate("vendedorAct")
      .populate("vendedorOrg")
      .populate("diseniadorAct")
      .populate("diseniadorOrg")
      .exec((err: any, historialesDB: Array<any>) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        } else {
          return resp.json({
            ok: true,
            historialesDB,
          });
        }
      });
  }
}
