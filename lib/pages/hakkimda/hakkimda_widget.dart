import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:simple_gradient_text/simple_gradient_text.dart';
import 'hakkimda_model.dart';
export 'hakkimda_model.dart';

class HakkimdaWidget extends StatefulWidget {
  const HakkimdaWidget({Key? key}) : super(key: key);

  @override
  _HakkimdaWidgetState createState() => _HakkimdaWidgetState();
}

class _HakkimdaWidgetState extends State<HakkimdaWidget> {
  late HakkimdaModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _unfocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => HakkimdaModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    _unfocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
      appBar: AppBar(
        backgroundColor: FlutterFlowTheme.of(context).primaryColor,
        automaticallyImplyLeading: true,
        title: Text(
          FFLocalizations.of(context).getText(
            'mt2hlzom' /* Hakkımda */,
          ),
          style: FlutterFlowTheme.of(context).title2.override(
                fontFamily: 'Poppins',
                color: Colors.white,
                fontSize: 22.0,
              ),
        ),
        actions: [],
        centerTitle: false,
        elevation: 2.0,
      ),
      body: SafeArea(
        child: GestureDetector(
          onTap: () => FocusScope.of(context).requestFocus(_unfocusNode),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 48.0, 0.0, 48.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: MediaQuery.of(context).size.width * 0.7,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(15.0),
                          shape: BoxShape.rectangle,
                          border: Border.all(
                            color: FlutterFlowTheme.of(context).secondaryColor,
                            width: 3.0,
                          ),
                        ),
                        alignment: AlignmentDirectional(0.0, 0.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 16.0, 16.0, 12.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        2.0, 2.0, 2.0, 2.0),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(40.0),
                                      child: Image.asset(
                                        'assets/images/Screenshot_2023-03-09_231500.jpg',
                                        width: 150.0,
                                        height: 150.0,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        12.0, 0.0, 0.0, 0.0),
                                    child: GradientText(
                                      FFLocalizations.of(context).getText(
                                        'setyazit' /* Yavuz Selimhan Kaya */,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .title3
                                          .override(
                                            fontFamily: 'Outfit',
                                            color: Color(0xFF4B39EF),
                                            fontSize: 50.0,
                                            fontWeight: FontWeight.w500,
                                          ),
                                      colors: [
                                        FlutterFlowTheme.of(context)
                                            .primaryColor,
                                        FlutterFlowTheme.of(context)
                                            .secondaryColor
                                      ],
                                      gradientDirection: GradientDirection.ltr,
                                      gradientType: GradientType.linear,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: FFLocalizations.of(context).getText(
                                      'cd1xhwkf' /* Hakkımda */,
                                    ),
                                    style: TextStyle(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 35.0,
                                    ),
                                  )
                                ],
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .primaryColor,
                                    ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              child: Text(
                                FFLocalizations.of(context).getText(
                                  'jgps29lv' /* Ben Yavuz, eğer siteyi güncell... */,
                                ),
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                              ),
                            ),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: FFLocalizations.of(context).getText(
                                      'dfs6xie4' /* Flutter */,
                                    ),
                                    style: TextStyle(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 35.0,
                                    ),
                                  )
                                ],
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .primaryColor,
                                    ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              child: Text(
                                FFLocalizations.of(context).getText(
                                  'ytgauwc5' /* 9.sınıfta Tübitak projesi olar... */,
                                ),
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                              ),
                            ),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: FFLocalizations.of(context).getText(
                                      'cvf0cnw0' /* Çevirmenlik */,
                                    ),
                                    style: TextStyle(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 35.0,
                                    ),
                                  )
                                ],
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .primaryColor,
                                    ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              child: Text(
                                FFLocalizations.of(context).getText(
                                  'lgyonbfu' /* 2021 yılında yeni satın almış ... */,
                                ),
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                              ),
                            ),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: FFLocalizations.of(context).getText(
                                      'qqj12m2q' /* Reverse Engineering */,
                                    ),
                                    style: TextStyle(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 35.0,
                                    ),
                                  )
                                ],
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .primaryColor,
                                    ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              child: Text(
                                FFLocalizations.of(context).getText(
                                  't5rpvvi1' /* Çeviri heyecanımın ilerlemesi ... */,
                                ),
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                              ),
                            ),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: FFLocalizations.of(context).getText(
                                      'nbyw1ysk' /* FRC, VRC ve TEKNOFEST */,
                                    ),
                                    style: TextStyle(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 35.0,
                                    ),
                                  )
                                ],
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .primaryColor,
                                    ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              child: Text(
                                FFLocalizations.of(context).getText(
                                  'ci17rimo' /* 2022 Yılının Mart ayında FRC İ... */,
                                ),
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                              ),
                            ),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: FFLocalizations.of(context).getText(
                                      'f7tj702i' /* Fotoğraflar */,
                                    ),
                                    style: TextStyle(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 35.0,
                                    ),
                                  )
                                ],
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      fontFamily: 'Poppins',
                                      color: FlutterFlowTheme.of(context)
                                          .primaryColor,
                                    ),
                              ),
                            ),
                            Image.asset(
                              'assets/images/Screenshot_2023-03-09_231500.jpg',
                              width: MediaQuery.of(context).size.width * 1.0,
                              height: 500.0,
                              fit: BoxFit.fitHeight,
                            ),
                            Image.asset(
                              'assets/images/Screenshot_2023-03-09_235429.jpg',
                              width: MediaQuery.of(context).size.width * 1.0,
                              height: 500.0,
                              fit: BoxFit.fitHeight,
                            ),
                            Image.asset(
                              'assets/images/Screenshot_2023-03-09_235602.jpg',
                              width: MediaQuery.of(context).size.width * 1.0,
                              height: 500.0,
                              fit: BoxFit.fitHeight,
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 20.0),
                              child: Image.asset(
                                'assets/images/Screenshot_2023-03-09_235647.jpg',
                                width: MediaQuery.of(context).size.width * 1.0,
                                height: 500.0,
                                fit: BoxFit.fitHeight,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
